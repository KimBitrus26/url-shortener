const transporter = require("../config/email");

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif; line-height:1.6; color:#333">
        <h2>Hello ${name || "there"},</h2>
        <p>You requested to reset your password. Please click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" 
             style="background:#007BFF;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The ${process.env.APP_NAME || "Team"}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Email delivery failed. Please try again later.");
  }
};

const sendPasswordChangedEmail = async (to, name) =>{
  const subject = "Password Changed Successfully";
  const html = `
    <p>Hi ${name || "User"},</p>
    <p>Your password has been changed successfully. If you did not make this change, please contact support immediately.</p>
    <p>Regards,<br/>Your App Team</p>
  `;

  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
  });
}


module.exports = {
    sendPasswordResetEmail,
    sendPasswordChangedEmail
     };
