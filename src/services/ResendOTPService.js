const OtpCode = require("../models/OtpCode");
const User = require("../models/User");
const { sendOtpSmsTwilio } = require("../config/twilioSMS");

async function resendOtp(userId) {
  try {
  
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.phone) {
      throw new Error("User does not have a phone number to verify");
    }

    await user.phoneVerified();

    await OtpCode.deleteMany({
      user: userId,
      phone_number: user.phone,
      is_used: false,
    });

    const otp = await OtpCode.create({
      user: userId,
      country_code: user.countryCode,
      phone_number: user.phone,
    });

    await sendOtpSmsTwilio(otp.code, user.countryCode, user.phone);
    
    return {

      userId: userId,
    };
  } catch (error) {
    throw new Error("Failed to resend OTP: " + error.message);
  }
}

module.exports = {
  resendOtp,
};
