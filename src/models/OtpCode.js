const mongoose = require("mongoose");

const OTP_LENGTH = 6;

function generateOtp() {
  return String(
    Math.floor(Math.random() * Math.pow(10, OTP_LENGTH))
  ).padStart(OTP_LENGTH, "0");
}

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    code: {
      type: String,
      default: generateOtp,
      minlength: OTP_LENGTH,
      maxlength: 64,
    },

    is_used: {
      type: Boolean,
      default: false,
    },

    country_code: {
      type: String,
      maxLength: 4,
    },

    phone_number: {
      type: String,
      maxLength: 18,
    },
  },
  { timestamps: true }
);

otpSchema.methods.expired = function () {
  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = new Date();
  return now - this.createdAt > FIVE_MINUTES;
};

otpSchema.methods.otpVerified = async function () {
  this.is_used = true;
  await this.save();
};

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("OtpCode", otpSchema);
