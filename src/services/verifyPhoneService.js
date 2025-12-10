const OtpCode = require("../models/OtpCode");
const User = require("../models/User")

async function verifyPhone(userId, code) {
  try {

    const userPhoneVerified = await User.findOne({ _id: userId });
    await userPhoneVerified.phoneVerified();
    
    const otp = await OtpCode.findOne({
      user: userId,
      code,
      is_used: false,
    }).sort({ createdAt: -1 }); 

    if (!otp) {
      throw new Error("Invalid OTP code");
    }

    if (otp.expired()) {
      throw new Error("OTP has expired");
    }

    await otp.otpVerified();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { isPhoneVerified: true },
      { new: true }
    );
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  } catch (error) {
    throw new Error("Phone verification failed: " + error.message);
  }
}

module.exports = {
  verifyPhone,
};
