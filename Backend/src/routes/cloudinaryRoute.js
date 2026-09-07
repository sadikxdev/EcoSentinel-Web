import express from "express";
import testCloudinary from "../controllers/cloudinaryController.js";

const router = express.Router();

router.get("/test", testCloudinary);

export default router;