const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyUser,
  resendOTP,
  forgotPassword,
  resetPassword,
  loginUser,
} = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/verify-email", verifyUser);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", loginUser);

module.exports = router;
