import express from "express";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    message: "Authenticated user",
    user: req.user,
  });
});

export default router;
