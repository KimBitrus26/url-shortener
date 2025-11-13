const rateLimit = require("express-rate-limit");

// Prevent brute-force on login (max 5 tries in 10 minutes)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true, // returns rate limit info in headers
  legacyHeaders: false,
});

// Prevent abuse of refresh endpoint (max 20 in 15 minutes)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many refresh requests. Please wait a while.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, refreshLimiter };
