import axios, { all } from "axios";
import { getCache, setCache } from "./cacheService.js";
import { calculateTotal, getMetricsCacheKey, epochWeeks } from "../utils/helpers.js";
import categoryGroups from '../data/categoryGroups.js';


let categoryIds = [];

/**
 * Fetch and verify Church Metrics user by email
 * @param {string} email
 * @returns {Object|null} user object if found, otherwise null
 */
export const verifyCmUserByEmail = async (email) => {
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

export const getAllRecordsByCampus = async (options = {}) => {
  const cacheKey = getMetricsCacheKey(options);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  if (!campus_id) throw new Error("Campus ID is required.");

  // Calculate first and last day of the current month
  const now = new Date();
  const firstDayDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDayDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const firstDay = epochWeeks(firstDayDate)
  const lastDay = epochWeeks(lastDayDate)

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
          campus_id: campus_id,
          start_date: firstDay,
          end_date: lastDay,
        },
      }
    );

    const records = response.data || [];

    setCache(cacheKey, records);

    return records;
  } catch (err) {
    console.error(
      "[churchServices.js] | Error fetching records by campus:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
}

export const getAllRecordsByCampusByCategory_ORIG = async (options = {}) => {
  const { campus_id, category_id } = options;

  if (!campus_id) throw new Error("Campus ID is required.");
  if (!category_id) throw new Error("Category ID is required.");

  const now = new Date();
  const firstDayOfTheMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const firstDay = epochWeeks(firstDayOfTheMonth);

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
          category_id,
          campus_id: campus_id.campus_id,
          week_reference: firstDay,
        },
      }
    );

    const records = response.data || []
    let total = 0;
    let catName;
    const uniqueCategoryIds = new Set();
    
    if (!records || records.length === 0) {
      // Handle empty response
      total = 0;
      catName = '';

    } else {
      for (const record of records) {
        catName = record.category.name;
        total += record.value || 0;         // sum up all values
        if (record?.service_time_id) {
          uniqueCategoryIds.add(record.service_time_id); // track unique category IDs
        }
      }
    }

    const results = {
      "sub-total":total,
      "name":catName,
      services: uniqueCategoryIds.size
    };

    return results;
  } catch (err) {
    console.error(
      "[churchServices.js] | Error fetching records by campus & category:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};

export const getAllRecordsByCampusGrouped_ORIG = async (campus_id) => {
  if (!campus_id) throw new Error("Campus ID is required.");

  const groupedResults = {};
  const finalResult = {};
  let allRecords;
  let subTotal = 0;

  let overallTotal = 0;

  for (const [groupName, categoryIds] of Object.entries(categoryGroups)) {
    groupedResults[groupName] = {};
    let categoryTotal = 0;
    let groupTotal = 0;
    const groupCategoryIds = new Set();

    // Fetch records for all category_ids in parallel
    const categoryPromises = categoryIds.map(async (category_id) => {
      const records = await getAllRecordsByCampusByCategory({
        campus_id,
        category_id
      });
      return { category_id, records };
    });

    const results = await Promise.all(categoryPromises);
    results.forEach(({ category_id, records }) => {
      allRecords = results;
      groupedResults[groupName][category_id] = records;
      if (records && results.length > 1) {
          const node = results.find(item => item.category_id === category_id);
          groupTotal += (node ? node.records["sub-total"] : 0); 
        } else {
          groupTotal = records["sub-total"]
      }
    });
      categoryTotal = groupTotal;
      groupTotal = 0;
      subTotal += categoryTotal
    finalResult[groupName] = {
      allRecords,
      total: categoryTotal,
    };

    overallTotal = subTotal;
  }
  let groupSize = Object.keys(categoryGroups).length
  // Add overall totals
  finalResult["grand-total"] = overallTotal;
  finalResult.groups = groupSize;

  return finalResult;
};

export const getAllRecordsByCampusByCategory = async (options = {}) => {
  const { campus_id, category_id, week_reference } = options;

  if (!campus_id) throw new Error("Campus ID is required.");
  if (!category_id) throw new Error("Category ID is required.");

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
          category_id,
          campus_id: campus_id.campus_id || campus_id,
          week_reference, // 🔥 now dynamically passed in by grouped function
        },
      }
    );

    const records = response.data || [];
    let total = 0;
    let catName = "";
    const uniqueCategoryIds = new Set();

    if (records.length > 0) {
      for (const record of records) {
        catName = record.category?.name || "";
        total += record.value || 0;
        if (record?.service_time_id) {
          uniqueCategoryIds.add(record.service_time_id);
        }
      }
    }

    return {
      "sub-total": total,
      name: catName,
      services: uniqueCategoryIds.size,
    };
  } catch (err) {
    console.error(
      "[churchServices.js] | Error fetching records by campus & category:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};

export const getAllRecordsByCampusGrouped = async (options = {}) => {
  const { campus_id, start_date, end_date } = options;
  if (!campus_id) throw new Error("Campus ID is required.");

  const groupedResults = {};
  const finalResult = {};
  let allRecords;
  let subTotal = 0;
  let overallTotal = 0;

  // ⏱ Handle optional dates
  const now = new Date();
  const startDate = start_date
    ? new Date(start_date)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = end_date
    ? new Date(end_date)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month

  // Loop through each week (or any interval you want)
  const weekRefs = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    weekRefs.push(epochWeeks(current.toISOString().split("T")[0]));
    current.setDate(current.getDate() + 7);
  }

  // Loop through groups
  for (const [groupName, categoryIds] of Object.entries(categoryGroups)) {
    groupedResults[groupName] = {};
    let categoryTotal = 0;
    let groupTotal = 0;
    const groupCategoryIds = new Set();

    // Fetch all categories in parallel
    const categoryPromises = categoryIds.map(async (category_id) => {
      // Loop through each week reference to aggregate monthly totals
      let monthlyTotal = 0;
      let catName = "";
      let services = 0;

      for (const weekRef of weekRefs) {
        const records = await getAllRecordsByCampusByCategory({
          campus_id,
          category_id,
          week_reference: weekRef,
        });

        if (records) {
          monthlyTotal += records["sub-total"] || 0;
          catName = records.name;
          services += records.services || 0;
        }
      }

      return {
        category_id,
        records: {
          "sub-total": monthlyTotal,
          name: catName,
          services,
        },
      };
    });

    const results = await Promise.all(categoryPromises);

    results.forEach(({ category_id, records }) => {
      allRecords = results;
      groupedResults[groupName][category_id] = records;
      groupTotal += records["sub-total"] || 0;
    });

    categoryTotal = groupTotal;
    subTotal += categoryTotal;

    finalResult[groupName] = {
      allRecords,
      total: categoryTotal,
    };

    overallTotal = subTotal;
  }

  let groupSize = Object.keys(categoryGroups).length;

  finalResult["grand-total"] = overallTotal;
  finalResult.groups = groupSize;
  finalResult.date_range = {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };

  return finalResult;
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

