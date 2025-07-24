const express = require("express");
const pool = require("./src/config/db.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const authRoutes = require("./src/routes/authRoutes.js");

app.use("/api/auth", authRoutes);

const session = require("express-session");

app.get("/", (req, res) => {
  res.send("Welcome to the Learnerweave Auth API");
});

app.get("/db-test", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await pool.connect();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
});
