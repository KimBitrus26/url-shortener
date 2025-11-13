const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  createdByIp: {
    type: String,
  },
  usedByIp: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster lookups and automatic cleanup
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);