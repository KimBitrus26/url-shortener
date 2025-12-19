const User = require("../models/User");
const authService = require("../services/authService");
const { generateAccessToken } = require("../services/utils");
const setRefreshTokenCookie = require("../services/utils").setRefreshTokenCookie;
const { verifyPhone } = require("../services/verifyPhoneService");
const { resendOtp } = require("../services/ResendOTPService");


const createUser = async (req, res) => {

    try {
    const user = await authService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent to phone for verification.",
      data: user,
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.authenticateUser(email, password); 
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (!user.isPhoneVerified) return res.status(401).json({ success: false, message: "Phone number not verified" });

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Create refresh token in DB and send as cookie
    const refreshTokenPlain = await authService.createRefreshToken(user._id, req.ip);
    setRefreshTokenCookie(res, refreshTokenPlain);

    // Send access token and user info
    res.json({
      success: true,
      data: { id: user._id, email: user.email, name: user.name, accessToken }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};


// refresh endpoint: rotates refresh token and returns new access token & rotates cookie
const refreshToken = async (req, res) => {
  try {
    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";
    const token = req.cookies[cookieName];
    
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    // verify & rotate
    const dbToken = await authService.verifyRefreshToken(token);
    const user = dbToken.user;
    // rotate (create new refresh token and revoke old)
    const newRefreshToken = await authService.rotateRefreshToken(token, user._id, req.ip);

    // generate new access token
    const accessToken = generateAccessToken(user);

    // set new cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken, user: { id: user._id, email: user.email, name: user.name } }
    });
  } catch (err) {
    // On error, clear cookie to force re-login when appropriate
    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";
    res.clearCookie(cookieName, { path: "/api/auth" });
    res.status(401).json({ success: false, message: err.message });
  }
};


const logout = async (req, res) => {
  try {
    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";
    const token = req.cookies[cookieName];
    console.log("Logout token:", token);
    if (token) {
      await authService.revokeRefreshToken(token, req.ip);
    }
    res.clearCookie(cookieName, { path: "/api/auth" });
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Forgot password: sends reset token to user's email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Request password reset (generates token and sends email)
    await authService.requestPasswordReset(email, req.ip);

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent"
    });
  } catch (err) {
    // Log error but still return generic success message for security
    console.error("Forgot password error:", err);
    res.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent"
    });
  }
};


// Verify reset token (optional - checks if token is valid before showing reset form)
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required"
      });
    }

    // Verify the token is valid
    const isValid = await authService.verifyPasswordResetToken(token);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    res.json({
      success: true,
      message: "Token is valid"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


// Reset password: validates token and updates password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Reset the password
    await authService.resetPassword(token, newPassword, req.ip);

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password."
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

async function verifyPhoneController(req, res) {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({
        message: "User ID and code are required for phone verification",
      });
    }

    const user = await verifyPhone(userId, code);

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully",
      data: user,
    });
  } catch (error) {
    console.error("Phone verification error:", error.message);
    return res.status(400).json({
      message: error.message,
    });
  }
}

async function resendOtpController(req, res) {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to resend OTP",
      });
    }
    const result = await resendOtp(userId);

    return res.status(200).json({
        success: true,
        message: "OTP code resent successfully",
        data: result,
    });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    return res.status(400).json({
        success: false,
        message: error.message,

    });
  }
}

module.exports = {
  createUser,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  resendOtpController,
  verifyPhoneController,
  
};
