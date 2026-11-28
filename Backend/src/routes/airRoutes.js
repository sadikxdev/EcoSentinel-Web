import express from "express";
import { getAirQuality } from "../controllers/airController.js";

const router = express.Router();

router.get("/", getAirQuality);

export default router;
