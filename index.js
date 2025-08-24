const express = require("express");
const pool = require("./src/config/db.js");
const cors = require("cors");

const pathsDb = require("./src/config/pathsDb.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

const authRoutes = require("./src/routes/authRoutes.js");
const pathRoutes = require("./src/routes/pathRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/paths", pathRoutes);

const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./src/models/userModel");
const jwt = require("jsonwebtoken");

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

// Paths db from Supabase
app.get("/supabase-test", async (req, res) => {
  try {
    const result =
      await pathsDb`SELECT NOW() as current_time, version() as db_version`;
    res.json({
      success: true,
      message: "Supabase connection successful",
      data: result[0],
    });
  } catch (error) {
    console.error("Supabase connection error:", error);
    res.status(500).json({
      success: false,
      message: "Supabase connection failed",
      error: error.message,
    });
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

//Google OAuth setup
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile.emails[0].value);
        const user = await User.findOrCreateGoogleUser(profile);
        console.log("User found/created:", user);
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        console.log("JWT generated successfully");
        user.token = token;
        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
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
