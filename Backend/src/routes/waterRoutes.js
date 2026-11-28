import express from "express";
import { getWaterQuality } from "../controllers/waterController.js";

const router = express.Router();

router.get("/", getWaterQuality);

export default router;
