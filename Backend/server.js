import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoute.js";
import otpRoutes from "./src/routes/otpRoute.js";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cloudinaryRoute from "./src/routes/cloudinaryRoute.js";
import imageRoutes from "./src/routes/imageRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many OTP requests. Please try again later.",
  },
});

app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");

  next();
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/otp", otpLimiter, otpRoutes);
app.use("/api/cloudinary", cloudinaryRoute);
app.use("/api/images", imageRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

export default app;