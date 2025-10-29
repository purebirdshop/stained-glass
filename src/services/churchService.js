import axios from "axios";
import { getCache, setCache } from "./cacheService.js";
import { getMetricsCacheKey, epochWeeks } from "../utils/helpers.js";
import categoryGroups from '../data/categoryGroups.js';


let categoryIds = [];

/**
 * Fetch and verify Church Metrics user by email
 * @param {string} email
 * @returns {Object|null} user object if found, otherwise null
 */
export const verifyUserByEmail = async (email) => {
  const cacheKey = `church_metrics_user_${email.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get("https://churchmetrics.com/api/v1/users.json", {
      headers: {
        "X-Auth-User": process.env.CHURCH_METRICS_USERNAME,
        "X-Auth-Key": process.env.CHURCH_METRICS_KEY,
        Accept: "application/json",
      },
    });

    // Find matching user by email (case-insensitive)
    const users = response.data || [];
    const matchedUser = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchedUser) {
      setCache(cacheKey, matchedUser, 3600); // cache 1 hr
      return matchedUser;
    }

    return null;
  } catch (err) {
    console.error("[ churchServices.js ] | Error fetching Church Metrics users:", err.response?.status, err.response?.data);
    throw err;
  }
};

export const getCampus = async (options = {}) => {
  const cacheKey = getMetricsCacheKey(options);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const params = { campus_id:options.id };

  try {
    const response = await axios.get(
      `https://churchmetrics.com/api/v1/campuses/${options.id}.json`,
      {
        headers: {
          "X-Auth-User": process.env.CHURCH_METRICS_USERNAME,
          "X-Auth-Key": process.env.CHURCH_METRICS_KEY,
          Accept: "application/json",
        }
      }
    );

    // Raw array returned by API
    let records = response.data;

    setCache(cacheKey, records);

    return records;
  } catch (err) {
    console.error("[ churchServices.js ] | Error fetching Church Metrics records:", err.response?.status, err.response?.data);
    throw err;
  }
};

export const getCampuses = async (options = {}) => {
  const cacheKey = getMetricsCacheKey(options);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      "https://churchmetrics.com/api/v1/campuses.json",
      {
        headers: {
          "X-Auth-User": process.env.CHURCH_METRICS_USERNAME,
          "X-Auth-Key": process.env.CHURCH_METRICS_KEY,
          Accept: "application/json",
        }
      }
    );

    // Raw array returned by API
    let records = response.data;

    setCache(cacheKey, records);

    return records;
  } catch (err) {
    console.error("[ churchServices.js ] | Error fetching Church Metrics records:", err.response?.status, err.response?.data);
    throw err;
  }
};

export const getAllRecords = async (options = {}) => {
  const cacheKey = getMetricsCacheKey(options);
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
          start_week:2910,
          campus_id: 65637, // BALBOA
        }
      }
    );

    // Raw array returned by API
    let records = response.data;

    // Optional filter by service_time_ids
    if (options.service_time_ids?.length) {
      records = records.filter(r =>
        options.service_time_ids.includes(r.service_time_id)
      );
    }

    setCache(cacheKey, records);

    return records;
  } catch (err) {
    console.error("[ churchServices.js ] | Error fetching Church Metrics records:", err.response?.status, err.response?.data);
    throw err;
  }
};

export const getServiceTimes = async () => {
  try {

    const response = await axios.get(
      "https://churchmetrics.com/api/v1/service_times.json",
      {
        headers: {
          "X-Auth-User": process.env.CHURCH_METRICS_USERNAME,
          "X-Auth-Key": process.env.CHURCH_METRICS_KEY,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("[ churchServices.js ] | Error fetching Church Metrics data:", err.response?.status, err.response?.data);
    throw err;
  }
}

export const getRecords = async (options = {}) => {
  const cacheKey = getMetricsCacheKey(options);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // Compute weeks if `date` is provided
    const weeks = [];
    if (options.date) {
      const dateObj = new Date(options.date);
      const startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
      const endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

      let current = new Date(startDate);
      while (current <= endDate) {
        weeks.push(epochWeeks(current));
        current.setDate(current.getDate() + 7);
      }
    } else if (options.week_reference) {
      weeks.push(options.week_reference);
    }

    // Hard-coded list of category IDs
    if(typeof options.category_id !== 'undefined') {
      categoryIds = 
        {
          "url-request":options.category_id.split(",").map(Number)
        };
    } else {
      categoryIds = categoryGroups;
    }

// Prepare the result container
const results = {};

for (const [groupName, categoryIds] of Object.entries(categoryGroups)) {
  let groupTotal = 0; // sum of all category values in this group
  const categoryTotals = {}; // individual totals for each category in group

  for (let category_id of categoryIds) {
    let categoryTotal = 0;

    for (let week of weeks) {
      const params = { week_reference: week, category_id };

      const response = await axios.get(
        "https://churchmetrics.com/api/v1/records.json",
        {
          headers: {
            "X-Auth-User": process.env.CHURCH_METRICS_USERNAME,
            "X-Auth-Key": process.env.CHURCH_METRICS_KEY,
            Accept: "application/json",
          },
          params,
        }
      );

      // Optionally filter by service_time_ids
      const weekRecords = options.service_time_ids?.length
        ? response.data.filter(r => options.service_time_ids.includes(r.service_time_id))
        : response.data;

      // Sum up the `value` key for this week + category
      const weekSum = weekRecords.reduce((sum, r) => sum + (r.value || 0), 0);
      categoryTotal += weekSum;
    }

    categoryTotals[category_id] = categoryTotal;
    groupTotal += categoryTotal;
  }

  // Store results for this group
  results[groupName] = {
    startDate: weeks[0],
    endDate: weeks[weeks.length - 1],
    total: groupTotal,
    categories: categoryTotals,
  };
}

setCache(cacheKey, results);
return results;
  } catch (err) {
    console.error(
      "[ churchServices.js ] | Error fetching Church Metrics records:",
      err
      // err.response?.status,
      // err.response?.data
    );
    throw err;
  }
};

