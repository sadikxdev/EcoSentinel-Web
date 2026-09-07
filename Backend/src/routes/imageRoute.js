import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  uploadMultipleImages,
  getUserImages,
  deleteUserImage
} from "../controllers/imageController.js";

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  upload.array("images", 10),
  uploadMultipleImages,
);

router.get("/my-images", authenticate, getUserImages);
router.delete("/:id", authenticate, deleteUserImage);

export default router;
