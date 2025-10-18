import express from "express";
import { fetchCCBData } from "../services/ccbService.js";
import { fetchChurchMetricsData } from "../services/churchService.js";
import { calculateMetrics } from "../utils/calculations.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [ccbData, churchData] = await Promise.all([
      // fetchCCBData(),
      fetchChurchMetricsData()
    ]);

    // const calculated = calculateMetrics(ccbData, churchData);

    res.json({
      ccbData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
