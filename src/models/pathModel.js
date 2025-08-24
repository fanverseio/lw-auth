// hard coded data for paths
// const paths = [
//   {
//     id: "1",
//     userId: 33, // Using the actual user id from your PostgreSQL users table
//     title: "JavaScript Fundamentals",
//     description:
//       "Learn the basics of JavaScript programming including variables, functions, and DOM manipulation.",
//     difficulty: "beginner",
//     estimatedHours: 20,
//     createdAt: "2024-01-15T10:00:00Z",
//     updatedAt: "2024-01-15T10:00:00Z",
//   },
//   {
//     id: "2",
//     userId: 33,
//     title: "React Development",
//     description:
//       "Build modern web applications with React, including hooks, state management, and component architecture.",
//     difficulty: "intermediate",
//     estimatedHours: 35,
//     createdAt: "2024-01-20T14:30:00Z",
//     updatedAt: "2024-01-20T14:30:00Z",
//   },
//   {
//     id: "3",
//     userId: 33,
//     title: "Advanced Node.js",
//     description:
//       "Master backend development with Node.js, Express, databases, and API design patterns.",
//     difficulty: "advanced",
//     estimatedHours: 45,
//     createdAt: "2024-02-01T09:15:00Z",
//     updatedAt: "2024-02-01T09:15:00Z",
//   },
// ];

const pathsDb = require("../config/pathsDb");

function getMaxId(arr) {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    const idNum = Number(arr[i].id);
    if (idNum > max) {
      max = idNum;
    }
  }
  return max;
}

const nextId = () => {
  const maxId = getMaxId(paths);
  return String(maxId + 1);
};

//CRUD of paths

class PathModel {
  // test the path from supabase is working
  static async testConnection() {
    try {
      const result = await pathsDb`SELECT NOW() as current_time`;
      return result[0];
    } catch (error) {
      console.error("Database connection test failed:", error);
      throw error;
    }
  }
  static async getAllPaths() {
    try {
      const result = await pathsDb`
        SELECT * FROM paths 
        ORDER BY created_at DESC
      `;
      return result;
    } catch (error) {
      console.error("Error fetching all paths:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pathsDb`
        SELECT * FROM paths 
        WHERE id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error("Error finding path by ID:", error);
      throw error;
    }
  }

  static async createPath(pathDetails) {
    try {
      const { userId, title, description, difficulty, estimatedHours } =
        pathDetails;

      const result = await pathsDb`
        INSERT INTO paths (user_id, title, description, difficulty, "estimatedHours", created_at, updated_at)
        VALUES (${userId}, ${title}, ${description}, ${difficulty}, ${estimatedHours}, NOW(), NOW())
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error("Error creating path:", error);
      throw error;
    }
  }

  static async updatePath(id, updatedDetails) {
    try {
      const { title, description, difficulty, estimatedHours } = updatedDetails;

      const result = await pathsDb`
        UPDATE paths 
        SET title = ${title}, 
            description = ${description}, 
            difficulty = ${difficulty}, 
            "estimatedHours" = ${estimatedHours}, 
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      return result[0] || null;
    } catch (error) {
      console.error("Error updating path:", error);
      throw error;
    }
  }

  static async deletePath(id) {
    try {
      // First delete associated path_data
      await pathsDb`
        DELETE FROM path_data 
        WHERE path_id = ${id}
      `;

      // Then delete the path
      const result = await pathsDb`
        DELETE FROM paths 
        WHERE id = ${id}
        RETURNING *
      `;

      return result[0] || null;
    } catch (error) {
      console.error("Error deleting path:", error);
      throw error;
    }
  }

  // For react flow path data
  static async updatePathData(pathId, nodes, edges) {
    try {
      // log saving new data
      console.log(
        `PATH UPDATE: ${pathId} | N:${nodes?.length || 0} E:${
          edges?.length || 0
        } | ${new Date().toLocaleTimeString()}`
      );

      const result = await pathsDb`
      INSERT INTO path_data (path_id, nodes, edges, created_at, updated_at)
      VALUES (${pathId}, ${JSON.stringify(nodes)}, ${JSON.stringify(
        edges
      )}, NOW(), NOW())
      ON CONFLICT (path_id)
      DO UPDATE SET 
        nodes = EXCLUDED.nodes,
        edges = EXCLUDED.edges,
        updated_at = NOW()
      RETURNING *
    `;

      return result[0];
    } catch (error) {
      console.error("Error updating path data:", error);
      throw error;
    }
  }

  static async getPathData(pathId) {
    try {
      const result = await pathsDb`
        SELECT * FROM path_data 
        WHERE path_id = ${pathId}
      `;
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching path data:", error);
      throw error;
    }
  }

  // paths for public board
  static async getPublicPaths() {
    try {
      const result = await pathsDb`
        SELECT * 
        FROM paths 
        WHERE is_public = true
        ORDER BY created_at DESC
      `;
      return result;
    } catch (error) {
      console.error("Error fetching public paths:", error);
      throw error;
    }
  }

  // Add this new method
  static async getPublicPathsCount() {
    try {
      const result = await pathsDb`
        SELECT COUNT(*) as total
        FROM paths 
        WHERE is_public = true
      `;
      return parseInt(result[0].total);
    } catch (error) {
      console.error("Error counting public paths:", error);
      throw error;
    }
  }

  static async getPublicPathById(pathId) {
    try {
      const result = await pathsDb`
        SELECT * FROM paths 
        WHERE id = ${pathId}
        AND is_public = true
      `;
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching public path by ID:", error);
      throw error;
    }
  }

  static async copyPath(originalId, newUserId, newTitle) {
    try {
      const result = await pathsDb`
      INSERT INTO paths (
        user_id, 
        title, 
        description, 
        difficulty, 
        "estimatedHours", 
        is_public, 
        created_by, 
        copied_from,
        copy_count,
        created_at, 
        updated_at
      )
      SELECT 
        ${newUserId}, 
        ${newTitle}, 
        description, 
        difficulty, 
        "estimatedHours", 
        false, 
        ${newUserId}, 
        ${originalId}, 
        0,
        NOW(), 
        NOW()
      FROM paths 
      WHERE id = ${originalId}
      RETURNING *
    `;

      await pathsDb`
    UPDATE paths 
    SET copy_count = copy_count + 1 
    WHERE id = ${originalId}`;

      return result[0];
    } catch (error) {
      console.error("Error copying path:", error);
      throw error;
    }
  }

  static async updatePathVisibility(pathId, userId, isPublic) {
    try {
      const result = await pathsDb`
        UPDATE paths 
        SET is_public = ${isPublic}
        WHERE id = ${pathId} AND user_id = ${userId}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PathModel;
