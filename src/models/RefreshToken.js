const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, index: true }, // SHA256(token)
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
  replacedByTokenHash: { type: String, default: null },
  revokedAt: { type: Date, default: null },
  createdByIp: { type: String, default: null },
  revokedByIp: { type: String, default: null }
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
