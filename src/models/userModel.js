const pool = require("../config/db.js");
const emailValidation = require("../utils/validation.js");

class User {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  static async create(email, hashedPassword) {
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, email_verified, created_at",
      [email, hashedPassword]
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
    const otp = Math.floor(100000 + Math.random() * 900000);
    await pool.query("UPDATE users SET otp = $1 WHERE email = $2", [
      otp,
      email,
    ]);
    return otp;
  }

  // verify email with OTP
  static async verifyEmail(email, otp) {
    try {
      // check email and otp are given
      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }

      console.log(`Verifying email: ${email} with OTP: ${otp}`);

      // verify OTP
      const otpOnDb = await User.verifyEmail(email, otp);

      if (!otpOnDb) {
        throw new Error("Invalid OTP");
      }

      // check if OTP has expired
      if (new Date(otpOnDb.expires_at) < new Date()) {
        throw new Error("OTP has expired");
      }

      // update email_verified to true
      await User.updateEmailVerified(email);
    } catch (error) {}
  }
}

module.exports = User;
