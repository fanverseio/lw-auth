const AuthService = require("../services/authService");

const jwt = require("jsonwebtoken");
const UserProfile = require("../models/userProfileModel");

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // call AuthService to register user
    const result = await AuthService.registerUser(email, password);

    if (result.user) {
      await UserProfile.createProfile(result.user.id);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Verifying user with email:", email, "and OTP:", otp);

    const result = await AuthService.verifyEmail(email, otp);

    res.status(200).json({ result, message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying user:", error);
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await AuthService.resendOTP(email);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await AuthService.forgetPassword(email);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in forget password:", error);
    res
      .status(500)
      .json({ error: "Failed to process forget password request" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, OTP, and new password are required" });
    }

    const result = await AuthService.resetPassword(email, otp, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

module.exports = {
  registerUser,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
};
