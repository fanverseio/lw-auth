const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyUser,
  resendOTP,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/verify-email", verifyUser);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
