const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    countryCode: {
      type: String,
      trim: true,
      required: [true, "Please provide a country code"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Please provide a phone number"],
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


userSchema.methods.phoneVerified = async function () {
  if (this.isPhoneVerified) {
    throw new Error("Phone number is already verified and cannot be changed.");
  }
}
module.exports = mongoose.model("User", userSchema);
