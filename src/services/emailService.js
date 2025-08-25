const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  secure: true,
});

// sending out OTP to user email
const sendOTPEmail = async (email, otp) => {
  console.log(`[EMAIL SERVICE] Sending OTP to: ${email}`);
  const mailOptions = {
    from: `"Auth API" <${process.env.GMAIL_USER}>`, // Sender address
    to: email,
    subject: "Verify Your Email Address - Auth API",
    text: `Hello,\n\nPlease use the following One-Time Password (OTP) to verify your email address for Auth API: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Auth API Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Hello,</p>
        <p>Please use the following One-Time Password (OTP) to verify your email address for <strong>Auth API</strong>:</p>
        <p style="font-size: 24px; font-weight: bold; color: #333;">${otp}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr>
        <p>Thanks,<br>The Auth API Team</p>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// after user verified, send welcome email
const sendWelcomeEmail = async (email) => {
  console.log(`[EMAIL SERVICE] Sending welcome email to: ${email}`);
  const mailOptions = {
    from: `"Auth API" <${process.env.GMAIL_USER}>`, // Sender address
    to: email,
    subject: "Welcome email",
    text: `Hello,\n\nWelcome to Auth API! We're excited to have you on board.\n\nYour account has been successfully created and you can now start using our services.\n\nIf you have any questions or need assistance, please don't hesitate to reach out to our support team.\n\nBest regards,\nThe Auth API Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Auth API!</h2>
        <p>Hello,</p>
        <p>We're excited to have you on board. 🎉</p>
        <p>Your account has been successfully created and you can now start using our services.</p>
        <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
        <hr>
        <p>Best regards,<br>The Auth API Team</p>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  console.log(`[EMAIL SERVICE] Sending password reset email to: ${email}`);

  const frontendUrl = process.env.FRONTEND_URL || "https://learnerweave.space";
  const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(
    email
  )}&token=${token}`;
  console.log(`[EMAIL SERVICE] Reset link: ${resetLink}`);

  const mailOptions = {
    from: `"Auth API" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - Auth API",
    text: `Hello,\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.\n\nThanks,\nThe Auth API Team`,
    html: `<div style=\"font-family: Arial, sans-serif; line-height: 1.6;\"><h2>Password Reset Request</h2><p>Hello,</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href=\"${resetLink}\">Reset Password</a></p><p>This link is valid for <strong>1 hour</strong>.</p><p>If you did not request this, please ignore this email.</p><hr><p>Thanks,<br>The Auth API Team</p></div>`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
