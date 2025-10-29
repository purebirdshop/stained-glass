import axios from "axios";
import { getCache, setCache } from "./cacheService.js";
import { getCacheKey, epochWeeks } from "../utils/helpers.js";
import categoryGroups from "../data/categoryGroups.json" assert { type: "json" };


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

export const getAllRecords = async (options = {}) => {
  const cacheKey = "church_metrics_records";
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
  const cacheKey = getCacheKey(options);
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
      categoryIds = options.category_id.split(",").map(Number) 
    } else {
      categoryIds = [
        302229,
        302227,
        306757,
        302225,
        304721,
        304720,
        652218,
        648461,
        391753,
        644934,
        633276,
        302233,
        679252 
      ]
    }

// Prepare the result container
const categoryTotals = {};

// If you want start/end *dates* as ISO strings instead of week numbers,
// you can compute them from your date param earlier; here we keep week values.
// (weeks[0] is first week_reference, weeks[weeks.length-1] is last)

for (const category_id of categoryIds) {
  let totalValue = 0;
  let categoryName = null;
  let startWeekValue = null; // value for first week found
  let endWeekValue = null;   // value for last week found

  // Loop weeks in order so start/end assignment is straightforward
  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i];
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

    // normalize response to array
    const recordsThisWeek = Array.isArray(response.data) ? response.data : (Array.isArray(response.data.records) ? response.data.records : []);

    // filter to only the desired service_time_ids (if provided)
    const filteredByServiceTime = options.service_time_ids?.length
      ? recordsThisWeek.filter(r => options.service_time_ids.includes(r.service_time_id))
      : recordsThisWeek;

    // Sum values for this week and capture categoryName (first found)
    let weekSum = 0;
    for (const rec of filteredByServiceTime) {
      // defensive: ensure numeric value
      const val = typeof rec.value === "number" ? rec.value : Number(rec.value) || 0;
      weekSum += val;

      if (!categoryName && rec.category && rec.category.Name) {
        categoryName = rec.category.Name;
      }
    }

    // add this week's sum to category total
    totalValue += weekSum;

    // set startWeekValue if this is the first week where we found data
    if (startWeekValue === null && weekSum !== 0) {
      startWeekValue = weekSum;
    }

    // always update endWeekValue if this week had any data (so last non-empty week)
    if (weekSum !== 0) {
      endWeekValue = weekSum;
    }
  }

  // Build summary for this category
  const summary = {
    startDateRef: weeks[0],
    endDateRef: weeks[weeks.length - 1],
    categoryName: categoryName || null,
    startValue: startWeekValue !== null ? startWeekValue : 0,
    endValue: endWeekValue !== null ? endWeekValue : 0,
    total: totalValue
  };

  // optional 'calculated' flag: compute average per-week if requested
  if (options.calculated) {
    const denom = weeks.length || 1;
    summary.average = +(totalValue / denom).toFixed(2); // rounded to 2 decimals
  }

  categoryTotals[category_id] = summary;
}

// categoryTotals now holds the object you requested

setCache(cacheKey, categoryTotals);
return categoryTotals;
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

