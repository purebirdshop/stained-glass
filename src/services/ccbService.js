import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { getCache, setCache } from "./cacheService.js";
import { getCcbCacheKey } from "../utils/helpers.js";

// const parser = new XMLParser();
const parser = new XMLParser();
const campusListParser = new XMLParser({
    ignoreAttributes: false,        // keep all attributes
    attributeNamePrefix: "",        // remove default "@_" prefix
    textNodeName: "text",           // optional: for text content
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      return name === "campus";     // ensure campuses are always arrays
    }
  });

export const fetchCampusList = async (options = {}) => {
  const cacheKey = getCcbCacheKey(options);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${process.env.CCB_API_URL}?srv=campus_list`, {
    auth: {
      username: process.env.CCB_USERNAME,
      password: process.env.CCB_PASSWORD
    },
    headers: { Accept: "application/xml" }
  });

  const jsonData = campusListParser.parse(response.data);
  setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchCampusProfile = async (options = {}) => {
  const cacheKey = getCcbCacheKey(options);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const params = { id:options.id };

  const response = await axios.get(
    `${process.env.CCB_API_URL}?srv=campus_profile`, 
    {
      auth: {
        username: process.env.CCB_USERNAME,
        password: process.env.CCB_PASSWORD
      },
      headers: {
        Accept: "application/xml"
      },
      params,
    }
  );

  const jsonData = campusListParser.parse(response.data);
  setCache(cacheKey, jsonData);
  return jsonData;
};