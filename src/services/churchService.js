import axios from "axios";
import { getCache, setCache } from "./cacheService.js";

export const fetchChurchMetricsData = async () => {
  const cacheKey = "church_metrics";
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      "https://churchmetrics.com/api/v1/records.json",
      {
        headers: {
          "X-Auth-User": process.env.CHURCH_METRICS_USERNAME,
          "X-Auth-Key": process.env.CHURCH_METRICS_KEY,
          Accept: "application/json",
        },
        params: {
          start_week: 2910, //2025-10-18
          campus_id: 65637, // BALBOA
          // campus_id: 66085 // VIRTUAL
          category_id: 302229 // Auditorium
          // category_id: 302224 // Kidz Church
        },
      }
    );

    setCache(cacheKey, response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching Church Metrics data:", err.response?.status, err.response?.data);
    throw err;
  }
};
