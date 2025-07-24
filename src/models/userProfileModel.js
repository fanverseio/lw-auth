const pool = require("../config/db");

class UserProfile {
  static async createProfile(userId) {
    await pool.query(
      "INSERT INTO user_profiles (user_id) VALUES ($1) RETURNING id",
      [userId]
    );
  }

  static async getProfile(userId) {
    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  }

  static async updateProfile(userId, { name, bio, link }) {
    await pool.query(
      "UPDATE user_profiles SET name = $1, bio = $2, link = $3 WHERE user_id = $4",
      [name, bio, link, userId]
    );
  }
}

module.exports = UserProfile;
