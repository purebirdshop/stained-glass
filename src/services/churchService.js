import axios from "axios";
import { getCache, setCache } from "./cacheService.js";

export const fetchChurchMetricsData = async () => {
  const cacheKey = "church_metrics";
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await axios.get(process.env.CHURCH_METRICS_URL, {
    headers: { Authorization: `Bearer ${process.env.CHURCH_METRICS_KEY}` }
  });

  setCache(cacheKey, response.data);
  return response.data;
};
