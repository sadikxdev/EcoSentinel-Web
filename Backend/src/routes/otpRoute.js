import express from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import {
  sendOtpByEmail,
  verifyOtpByEmail,
} from "../controllers/otpController.js";

const router = express.Router();

const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many OTP requests — try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    if (req.body.email) return req.body.email.toLowerCase();
    return ipKeyGenerator(req.ip);
  },
  message: { error: "Too many OTP verification attempts — try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/send-otp-email", sendOtpLimiter, sendOtpByEmail);
router.post("/verify-otp-email", verifyOtpLimiter, verifyOtpByEmail);

export default router;
