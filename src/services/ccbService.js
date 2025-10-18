import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { getCache, setCache } from "./cacheService.js";

const parser = new XMLParser();

export const fetchCCBData = async () => {
  const cacheKey = "ccb_data";
  const cached = getCache(cacheKey);
  if (cached) return cached;

  console.log('hello world');
  const response = await axios.get(process.env.CCB_API_URL, {
    auth: {
      username: process.env.CCB_USERNAME,
      password: process.env.CCB_PASSWORD
    },
    headers: { Accept: "application/xml" }
  });

  const jsonData = parser.parse(response.data);
  setCache(cacheKey, jsonData);
  return jsonData;
};
