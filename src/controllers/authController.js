const AuthService = require("../services/authService");

const jwt = require("jsonwebtoken");
const UserProfile = require("../models/userProfileModel");

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // call AuthService to register user
    const result = await AuthService.registerUser(email, password);

    // Temporarily commented out until user_profiles table structure is fixed
    // if (result.user) {
    //   await UserProfile.createProfile(result.user.id);
    // }

    res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Add debugging to see what we received
    console.log("Request body:", req.body);
    console.log("Extracted email:", email, "type:", typeof email);
    console.log("Extracted code:", code, "type:", typeof code);

    const result = await AuthService.verifyEmail(email, code);

    res.status(200).json({ result, message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying user:", error);
    res
      .status(400)
      .json({ error: error.message || "Email verification failed" }); // <-- Add this line
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await AuthService.forgotPassword(email);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in forgot password:", error);
    res
      .status(500)
      .json({ error: "Failed to process forgot password request" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, token, and new password are required" });
    }

    const result = await AuthService.resetPassword(email, token, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(401).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  verifyUser,
  resendOTP,
  forgotPassword,
  resetPassword,
  loginUser,
};
