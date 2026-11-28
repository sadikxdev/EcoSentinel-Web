
import { fetchWaterQuality } from "../services/waterService.js";

export const getWaterQuality = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== "string" || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Station name or district is required",
      });
    }

    const data = await fetchWaterQuality(search.trim());

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch water quality data",
    });
  }
};
