const pool = require("../config/db");

class UserProfile {
  static async createProfile(email) {
    const result = await pool.query(
      "INSERT INTO user_profiles (email, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
      [email]
    );
    return result.rows[0];
  }

  static async getProfile(email) {
    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE email = $1",
      [email]
    );

    return result.rows[0];
  }

  static async updateProfile(email, { name, bio, link }) {
    try {
      const result = await pool.query(
        `INSERT INTO user_profiles (email, name, bio, link) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) 
       DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, link = EXCLUDED.link
       RETURNING *`,
        [email, name, bio, link]
      );

      return result.rows[0];
    } catch (error) {
      console.error(`[UPDATE ERROR] Database error:`, error);
      throw error;
    }
  }
}

module.exports = UserProfile;
