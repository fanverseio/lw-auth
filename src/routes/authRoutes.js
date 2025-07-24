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

module.exports = router;
