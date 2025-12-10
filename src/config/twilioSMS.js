const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

async function sendOtpSmsTwilio(otpCode, countryCode, phoneNumber) {
  try {
    
    if (phoneNumber.startsWith("0")) {
      phoneNumber = phoneNumber.substring(1);
    }

    if (countryCode.startsWith("+")) {
      countryCode = countryCode.substring(1);
    }

    const formattedNumber = `+${countryCode}${phoneNumber}`;
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedNumber,
        channel: "sms",
        customCode: otpCode,
      });

    if (verification.status === "pending") {
      return { success: true, message: "OTP sent via Twilio Verify" };
    }

    return { success: false, message: "Failed to send OTP", data: verification };

  } catch (error) {
    console.error("Twilio Verify error:", error);
    return { success: false, error };
  }
}

module.exports = {
    sendOtpSmsTwilio
};
