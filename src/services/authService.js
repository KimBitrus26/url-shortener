const bcrypt = require("bcryptjs");
const Joi = require("joi");
const crypto = require("crypto");

const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const PasswordResetToken = require('../models/PasswordResetToken')
const { hashToken, generateRandomToken } = require("./utils");
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('./emailService')

const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);

// Joi validation schema
const userValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});


// create & persist refresh token record (store hash)
async function createRefreshToken(userId, ipAddress) {
  const token = generateRandomToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  const dbToken = new RefreshToken({
    user: userId,
    tokenHash,
    expiresAt,
    createdByIp: ipAddress
  });

  await dbToken.save();
  return token; // return plain token to give to client (cookie)
}

// rotate existing refresh token: revoke old, create new, mark relationship
async function rotateRefreshToken(oldTokenPlain, userId, ipAddress) {
  const oldHash = hashToken(oldTokenPlain);
  const dbOld = await RefreshToken.findOne({ tokenHash: oldHash });

  if (!dbOld || dbOld.revoked || dbOld.expiresAt < new Date()) {
    // token invalid or already revoked/expired
    // revoke entire chain for safety if possible
    if (dbOld && !dbOld.revoked) {
      dbOld.revoked = true;
      dbOld.revokedAt = new Date();
      dbOld.revokedByIp = ipAddress;
      await dbOld.save();
    }
    throw new Error("Invalid refresh token");
  }

  // create new refresh token
  const newTokenPlain = generateRandomToken();
  const newHash = hashToken(newTokenPlain);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  dbOld.revoked = true;
  dbOld.revokedAt = new Date();
  dbOld.revokedByIp = ipAddress;
  dbOld.replacedByTokenHash = newHash;
  await dbOld.save();

  const dbNew = new RefreshToken({
    user: userId,
    tokenHash: newHash,
    expiresAt,
    createdByIp: ipAddress
  });
  await dbNew.save();

  return newTokenPlain;
}


// verify refresh token exists and return associated user
async function verifyRefreshToken(tokenPlain) {
  const tokenHash = hashToken(tokenPlain);
  const dbToken = await RefreshToken.findOne({ tokenHash }).populate("user");

  if (!dbToken) throw new Error("Refresh token not found");
  if (dbToken.revoked) throw new Error("Refresh token revoked");
  if (dbToken.expiresAt < new Date()) throw new Error("Refresh token expired");

  return dbToken;
}

// revoke token explicitly (logout)
async function revokeRefreshToken(tokenPlain, ipAddress) {
  const tokenHash = hashToken(tokenPlain);
  const dbToken = await RefreshToken.findOne({ tokenHash });
  if (!dbToken) return false;
  dbToken.revoked = true;
  dbToken.revokedAt = new Date();
  dbToken.revokedByIp = ipAddress;
  await dbToken.save();
  return true;
}


const createUser = async (userData) => {
  // Validate input
  const { error } = userValidationSchema.validate(userData);
  if (error) {
     throw new Error(error.details[0].message);
  }

  //  Check if email exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new Error("Email already registered");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  //  Save user
  const user = new User({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  });

  await user.save();

  // Remove password before returning
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};


const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");
  return user;
};


// Request password reset - generates token and sends email
const requestPasswordReset = async (email, ipAddress) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  // If user doesn't exist, silently return (security: don't reveal if email exists)
  if (!user) {
    return;
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(64).toString("hex");
  
  // Hash token for storage
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expiration (1 hour from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Delete any existing reset tokens for this user
  await PasswordResetToken.deleteMany({ user: user._id });

  // Create new reset token
  await PasswordResetToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt,
    createdByIp: ipAddress,
  });

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  return true;
}

// Verify password reset token
const verifyPasswordResetToken = async (token)  => {
  // Hash the incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find valid token in database
  const resetToken = await PasswordResetToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
    usedAt: null,
  });

  return !!resetToken;
}

// Reset password using token
const  resetPassword = async (token, newPassword, ipAddress) => {
  // Hash the incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find valid token
  const resetToken = await PasswordResetToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
    usedAt: null,
  }).populate("user");

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  // Get user
  const user = resetToken.user;

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update user's password
  user.password = hashedPassword;
  await user.save();

  // Mark token as used
  resetToken.usedAt = new Date();
  resetToken.usedByIp = ipAddress;
  await resetToken.save();

  // Optional: Revoke all refresh tokens for security (force re-login on all devices)
  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date(), revokedByIp: ipAddress }
  );

  // Send confirmation email
  await sendPasswordChangedEmail(user.email, user.name);

  return true;
}



module.exports = {
    createUser,
    authenticateUser,
    createRefreshToken,
    rotateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    requestPasswordReset,
    resetPassword,
    verifyPasswordResetToken,


};
