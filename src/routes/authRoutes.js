const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyUser,
  resendOTP,
  forgotPassword,
  resetPassword,
  loginUser,
  updateProfile,
  getProfile,
} = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authMiddleware");
const passport = require("passport");

router.post("/register", registerUser);
router.post("/verify-email", verifyUser);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", loginUser);

router.post("/update-profile", authenticateJWT, updateProfile);

router.get("/protected", authenticateJWT, (req, res) => {
  res.status(200).json({
    message: "Access granted to protected route!",
    user: req.user,
  });
});

router.get("/profile", authenticateJWT, getProfile);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (req.user && req.user.token) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // react frontend
      res.redirect(
        `${frontendUrl}/auth/google/callback?token=${req.user.token}`
      );
    } else {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/auth/google/callback?error=Authentication failed`
      );
    }
  }
);

module.exports = router;
