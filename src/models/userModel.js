const pool = require("../config/db.js");
const emailValidation = require("../utils/validation.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class User {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  static async create(email, hashedPassword) {
    const result = await pool.query(
      "INSERT INTO users (email, password, email_verified) VALUES ($1, $2, $3) RETURNING id, email, email_verified, created_at",
      [email, hashedPassword, false]
    );
    return result.rows[0];
  }

  static async updateEmailVerified(userId) {
    await pool.query(
      "UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1",
      [userId]
    );
  }
  static async updatePassword(userId, hashedPassword) {
    await pool.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, userId]
    );
  }
  static async delete(userId) {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  }

  // Check if the email_verified is true
  static async emailVerified(email) {
    const result = await pool.query(
      "SELECT email_verified FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] ? result.rows[0].email_verified : false;
  }

  // create a OTP and push it to DB
  static async createAndStoreOTP(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP GENERATION] Generated OTP for ${email}: ${otp}`);

    // First delete any existing OTP for this email
    await pool.query("DELETE FROM otp_codes WHERE email = $1", [email]);

    // Then insert the new OTP with expiration time
    await pool.query(
      "INSERT INTO otp_codes (email, code, created_at, expires_at) VALUES ($1, $2, NOW(), NOW() + INTERVAL '10 minutes')",
      [email, otp]
    );
    console.log("[MODEL] OTP inserted into DB for email:", email, "OTP:", otp);
    return otp;
  }

  // send OTP to email
  static async sendOTP(email) {
    const otp = await this.createAndStoreOTP(email);
    const { sendOTPEmail } = require("../services/emailService");
    await sendOTPEmail(email, otp);
    return otp;
  }
  // verify email with OTP
  static async verifyUser(email, code) {
    try {
      const result = await pool.query(
        "SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()",
        [email, code]
      );

      if (result.rows.length === 0) {
        console.log("Invalid or expired code for email:", email);
        throw new Error("Invalid or expired code");
      }

      return result.rows[0];
    } catch (error) {
      console.log("Something gone wrong verifying code.");
      throw error;
    }
  }
  // OTP expiration
  static isOTPExpired(createdAt) {
    const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    const currentTime = new Date().getTime();
    return currentTime - new Date(createdAt).getTime() > otpExpirationTime;
  }

  // update email_verified status
  static async updateEmailVerified(email) {
    await pool.query(
      "UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE email = $1",
      [email]
    );
  }

  // delete OTP from DB
  static async deleteOTP(email) {
    await pool.query("DELETE FROM otp_codes WHERE email = $1", [email]);
  }

  // password reset token
  static async passwordResetToken(email) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 3600000); // 1 hour from now

    console.log(
      `[USER MODEL] Password reset token generated for ${email}: ${token}`
    );

    // Delete any existing tokens for this email
    await pool.query("DELETE FROM password_reset_tokens WHERE email = $1", [
      email,
    ]);

    // Insert new token
    await pool.query(
      "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
      [email, token, expiration]
    );

    return token;
  }

  // update password
  static async updatePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
    console.log(`[PASSWORD RESET] Password updated for ${email}`);
  }

  static async deletePasswordResetToken(email) {
    await pool.query("DELETE FROM password_reset_tokens WHERE email = $1", [
      email,
    ]);
    console.log(`[PASSWORD RESET] Token consumed for ${email}`);
  }

  // Add missing methods
  static async recentOTPCount(email) {
    // For now, return 0 to allow OTP sending
    // You can implement actual logic to count daily OTP requests later
    return 0;
  }

  static async validatePasswordResetToken(email, token) {
    const result = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE email = $1 AND token = $2 AND expires_at > NOW()",
      [email, token]
    );
    return result.rows[0];
  }

  static async findOrCreateGoogleUser(profile) {
    const email = profile.emails[0].value;
    let user;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      user = result.rows[0];
      console.log("User found:", user);
    } else {
      // Create a new user if not found

      // Google user all used same password
      const passwordOAuth = await bcrypt.hash("GoogleOAuth", 10);

      const newUserResult = await pool.query(
        "INSERT INTO users (email, password, email_verified) VALUES ($1, $2, $3) RETURNING id, email",
        [email, passwordOAuth, true]
      );
      user = newUserResult.rows[0];
      console.log("New user created:", user);
    }
    return user;
  }
}

module.exports = User;
