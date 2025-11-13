const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

function generateAccessToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// helper to set the refresh token cookie
const  setRefreshTokenCookie = (res, token) => {
  const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";
  const isSecure = (process.env.REFRESH_TOKEN_COOKIE_SECURE === "true") || process.env.NODE_ENV === "production";
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "Strict",
    path: "/api/auth", // limit cookie scope to auth endpoints (optional)
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000
  });
}

const  generateRandomToken =() => {
  return crypto.randomBytes(64).toString("hex"); // 128 hex chars
}

const hashToken = (token) =>{
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  generateAccessToken,
  hashToken,
  setRefreshTokenCookie,
  generateRandomToken,
};