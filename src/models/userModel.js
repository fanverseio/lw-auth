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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await pool.query(
      "INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
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
  static async verifyUser(email, otp) {
    try {
      const result = await pool.query(
        "SELECT * FROM otp_codes WHERE email = $1 AND code = $2",
        [email, otp]
      );

      if (result.rows.length === 0) {
        console.log("Invalid OTP or email.");
        throw new Error("Invalid OTP or email.");
      }

      return result.rows[0];
    } catch (error) {
      console.log("Something gone wrong verifying OTP.");

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
    await pool.query("UPDATE users SET otp = NULL WHERE email = $1", [email]);
  }

  // password reset token
  static async passwordResetToken(email) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 3600000);

    console.log(
      `[USER MODEL] Password reset token generated for ${email}: ${token}`
    );

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3",
      [token, expiration, email]
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

  static async deletePasswordResetToken(email, token) {
    await pool.query(
      "DELETE FROM password_reset_tokens WHERE email = $1 AND token = $2",
      [email, token]
    );
    console.log(`[PASSWORD RESET] Token consumed for ${email}`);
  }
}

module.exports = User;
