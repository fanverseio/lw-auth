const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const UserProfile = require("../models/userProfileModel.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const bcryptSaltRounds = 10;
const emailValidation = require("../utils/validation.js");
const {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
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
          throw new Error("Email already registered but not yet verified");
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

  static async verifyEmail(email, code) {
    try {
      // check if email and code are provided
      if (!email || !code) {
        throw new Error("Email and code are required");
      }

      console.log(
        `[AUTH SERVICE] Verifying email: ${email} with code: ${code}`
      );

      // check code (expiration is now checked in the database query)
      const optOnDb = await User.verifyUser(email, code);

      if (!optOnDb) {
        throw new Error("Invalid or expired code");
      }

      // update user email_verified status
      await User.updateEmailVerified(email);

      // delete OTP from DB
      await User.deleteOTP(email);

      // send welcome email
      await sendWelcomeEmail(email);
      console.log(`[AUTH SERVICE] Welcome email sent to: ${email}`);

      return { message: "Email verified successfully" };
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
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
      throw error;
    }
  }

  //forgot password
  static async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const userExists = await User.findByEmail(email);
      if (!userExists) {
        throw new Error("User with this email does not exist");
      }

      const token = await User.passwordResetToken(email);

      // Send password reset email
      await sendPasswordResetEmail(email, token);

      return { message: "Password reset link sent to email" };
    } catch (error) {
      console.error("Error sending password reset:", error);
      throw error;
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
      await User.deletePasswordResetToken(email); // Removed token parameter

      return { message: "Password reset successfully" };
    } catch (error) {
      console.log("Error resetting password:", error);
      throw new Error("Password reset failed");
    }
  }

  // Login
  static async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.email_verified) {
        throw new Error("Email not verified");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "30d",
      });

      return { token, user: { id: user.id, email: user.email } };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  static async updateProfile(email, profileData) {
    try {
      if (!email || !profileData) {
        throw new Error("Email and profile data are required");
      }

      const updatedUser = await UserProfile.updateProfile(email, profileData);

      return { message: "Profile updated successfully", user: updatedUser };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  static async getProfile(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      console.log(`Looking up profile for email: ${email}`);

      const profile = await UserProfile.getProfile(email);

      console.log(`Profile details: ${JSON.stringify(profile)}`);

      if (!profile) {
        console.error("Profile not found for email:", email);
        throw new Error("Profile not found");
      }
      return { profile };
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Profile not found");
    }
  }
}

module.exports = AuthService;
