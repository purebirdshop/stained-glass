import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { getCache, setCache } from "./cacheService.js";
import { getCcbCacheKey } from "../utils/helpers.js";

const parser = new XMLParser();
const campusListParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      return name === "campus";
    }
  });

export const fetchSingleAttendanceProfile = async (options = {}) => {
  const { event,start_date } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

  const response = await axios.get(`${process.env.CCB_API_URL}?srv=attendance_profile`, {
    auth: {
      username: process.env.CCB_USERNAME,
      password: process.env.CCB_PASSWORD
    },
    headers: {
      Accept: "application/xml"
    },
    params: {
      id:event,
      occurrence: start_date
    }
  });


  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchAllAttendanceProfiles = async (options = {}) => {
  const { start_date,end_date } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;
  const response = await axios.get(`${process.env.CCB_API_URL}?srv=attendance_profiles`, {
    auth: {
      username: process.env.CCB_USERNAME,
      password: process.env.CCB_PASSWORD
    },
    headers: {
      Accept: "application/xml"
    },
    params: {
      start_date,
      end_date
    }
  });


  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchCampusList = async () => {
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

  const response = await axios.get(`${process.env.CCB_API_URL}?srv=campus_list`, {
    auth: {
      username: process.env.CCB_USERNAME,
      password: process.env.CCB_PASSWORD
    },
    headers: {
      Accept: "application/xml"
    }
  });

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchCampusProfile = async (options = {}) => {
  const { campus } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

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
      params:{
        id:campus
      }
    }
  );

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchAllEventsProfiles = async (options = {}) => {
  const { start_date, page, per_page } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;
  const response = await axios.get(
    `${process.env.CCB_API_URL}?srv=event_profiles`, 
    // `${process.env.CCB_API_URL}?srv=event_profiles&modified_since=2025-11-01&page=1&per_page=20`, 
    {
      auth: {
        username: process.env.CCB_USERNAME,
        password: process.env.CCB_PASSWORD
      },
      headers: {
        Accept: "application/xml"
      },
      param:{
        modified_since:start_date,
        page,
        per_page,
      }
    }
  );

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchAllGroupProfiles = async (options = {}) => {
  const { start_date, page, per_page, include_participants } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

  const response = await axios.get(
    `${process.env.CCB_API_URL}?srv=group_profiles`,
    {
      auth: {
        username: process.env.CCB_USERNAME,
        password: process.env.CCB_PASSWORD
      },
      headers: {
        Accept: "application/xml"
      },
      params:{
        modified_since: '2025-10-01',
        include_participants:false,
        page,
        per_page:50
      }
    }
  );

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchAllGroupGroupings = async (options = {}) => {
  const { id } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

  const response = await axios.get(
    `${process.env.CCB_API_URL}?srv=group_type_detail`,
    {
      auth: {
        username: process.env.CCB_USERNAME,
        password: process.env.CCB_PASSWORD
      },
      headers: {
        Accept: "application/xml"
      },
      params:{
        group_type_id:id
      }
    }
  );

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchAllGroupsBySearch = async (options = {}) => {
  const { id } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

  const response = await axios.get(
    `${process.env.CCB_API_URL}?srv=group_search`,
    {
      auth: {
        username: process.env.CCB_USERNAME,
        password: process.env.CCB_PASSWORD
      },
      headers: {
        Accept: "application/xml"
      },
      params:{
        campus_id:id
      }
    }
  );

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};

export const fetchGroupPrticipants = async (options = {}) => {
  const { id } = options;
  // const cacheKey = getCcbCacheKey(options);
  // const cached = getCache(cacheKey);
  // if (cached) return cached;

  const response = await axios.get(
    `${process.env.CCB_API_URL}api.php?srv=group_participants`,
    {
      auth: {
        username: process.env.CCB_USERNAME,
        password: process.env.CCB_PASSWORD
      },
      headers: {
        Accept: "application/xml"
      },
      params:{
        srv: 'group_participants',
        id: 23
      }
    }
  );

  const jsonData = campusListParser.parse(response.data);
  // setCache(cacheKey, jsonData);
  return jsonData;
};