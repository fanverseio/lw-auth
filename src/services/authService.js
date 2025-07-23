const bycrpt = require("bcrypt");
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
const { log } = require("console");

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
        const userVerified = User.emailVerified(email);
        if (userVerified) {
          throw new Error("Email already registered and verified");
        } else {
          await User.sendOTP(email);
          return { message: "OTP sent to email for verification" };
        }
      }

      // hash the password
      const hashedPassword = await bycrpt.hash(password, bcryptSaltRounds);

      // create a new user
      const newUser = await User.create({
        email,
        password: hashedPassword,
      });

      // Send OTP for email verification
      const otp = await User.createAndStoreOTP(email);
      await sendOTPEmail(email, otp);

      return { message: "User registered successfully", user: newUser };
    } catch (error) {
      throw new Error("User registration failed");
    }
  }

  static async verifyEmail(email, otp) {
    try {
      // check if email and otp are provided
      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }

      log(`[AUTH SERVICE] Verifying email: ${email} with OTP: ${otp}`);

      // check OTP
      const optOnDb = await User.verifyEmail(email, otp);
    } catch (error) {}
  }

  // update email as verified
  static async updateEmailVerified(email) {
    await pool.query(
      "UPDATE users SET email_verified = true, updated_at = NOW() WHERE email = $1",
      [email]
    );
    console.log(`Email: ${email} has been verified successfully`);
  }
}
