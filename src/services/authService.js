const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const bcryptSaltRounds = 10;
const emailValidation = require("../utils/validation.js");
const {
  sendOTPEmail,
  sendWelcomeEmail,
} = require("../services/emailService.js");

class AuthService {
  static async registerUser(email, password) {
    try {
      // need email and password from user
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // check email is valid format
      if (!emailValidation.isValidEmailFormat(email)) {
        throw new Error("Invalid email format");
      }

      // check password is strong enough
      if (!emailValidation.isValidPasswordStrength(password)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one number, and be at least 8 characters long"
        );
      }

      // check if email has been used
      const userExists = await User.findByEmail(email);
      if (userExists) {
        const userVerified = await User.emailVerified(email);
        if (userVerified) {
          throw new Error("Email already registered and verified");
        } else {
          await User.sendOTP(email);
          return { message: "OTP sent to email for verification" };
        }
      }

      // hash the password
      const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds);

      // create a new user
      const newUser = await User.create(email, hashedPassword);

      // Send OTP for email verification
      await User.sendOTP(email);

      return { message: "User registered successfully", user: newUser };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  static async verifyEmail(email, otp) {
    try {
      // check if email and otp are provided
      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }

      console.log(`[AUTH SERVICE] Verifying email: ${email} with OTP: ${otp}`);

      // check OTP
      const optOnDb = await User.verifyEmail(email, otp);

      if (!optOnDb) {
        throw new Error("Invalid OTP or email");
      }

      // check if OTP is expired
      const otpExpired = User.isOTPExpired(optOnDb.created_at);
      if (otpExpired) {
        throw new Error("OTP has expired");
      }

      // update user email_verified status
      await User.updateEmailVerified(email);

      // delete OTP from DB
      await User.deleteOTP(email);

      // send welcome email
      await sendWelcomeEmail(email);
      console.log(`[AUTH SERVICE] Welcome email sent to: ${email}`);
    } catch (error) {
      console.error("Error verifying email:", error);
      throw new Error("Email verification failed");
    }
  }

  // Resend OTP

  static async resendOTP(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const userExists = await User.findByEmail(email);
      if (!userExists) {
        throw new Error("User with this email does not exist");
      }

      const userAlreadyVerified = await User.emailVerified(email);
      if (userAlreadyVerified) {
        throw new Error("Email is already verified");
      }

      const otpDayCount = await User.recentOTPCount(email);
      if (otpDayCount >= 3) {
        throw new Error(
          "You have reached the maximum number of OTP requests for today. Please try again tomorrow."
        );
      }

      const otp = await User.createAndStoreOTP(email);

      await sendOTPEmail(email, otp);

      return { message: "OTP resent successfully" };
    } catch (error) {
      console.error("Error resending OTP:", error);
      throw new Error("Resending OTP failed");
    }
  }

  //forget password
  static async forgetPassword(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const userExists = await User.findByEmail(email);
      if (!userExists) {
        throw new Error("User with this email does not exist");
      }

      const token = await User.passwordResetToken(email);

      return { message: "OTP sent to email for verification" };
    } catch (error) {
      console.error("Error sending OTP for password reset:", error);
      throw new Error("Sending OTP for password reset failed");
    }
  }

  // Password reset
  static async resetPassword(email, token, newPassword) {
    try {
      if (!email || !token || !newPassword) {
        throw new Error("Email, token, and new password are required");
      }

      const validateToken = await User.validatePasswordResetToken(email, token);
      if (!validateToken) {
        throw new Error("Invalid or expired password reset token");
      }

      // check password strength
      if (!emailValidation.isValidPasswordStrength(newPassword)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one number, and be at least 8 characters long"
        );
      }

      await User.updatePassword(email, newPassword);
      await User.deletePasswordResetToken(email);

      return { message: "Password reset successfully" };
    } catch (error) {
      console.log("Error resetting password:", error);
      throw new Error("Password reset failed");
    }
  }
}
