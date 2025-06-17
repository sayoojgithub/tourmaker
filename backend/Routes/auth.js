import express from "express";
import {
  login,
  verifyOtp,
  resetPassword,
  registerCompany,
  sendVerificationOtp,
} from "../Controllers/authController.js";

const router = express.Router();

router.post("/register-company", registerCompany);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/send-verification-email", sendVerificationOtp);

export default router;
