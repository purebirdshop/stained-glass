const formatTimeOfDay = (timeStr) => {
  // Ensure string, zero-pad hour/minute
  const str = timeStr.toString();
  const hour = str.slice(0, 2);
  const minute = str.slice(2, 4);

  return `2000-01-01T${hour}:${minute}:00.000Z`;
};

const calculateMetrics = (ccbData, churchData) => {
  // Example: combine attendance + giving totals
  const attendance = churchData.total_attendance || 0;
  const giving = ccbData?.response?.giving?.total || 0;

  const avgGivingPerPerson = attendance ? giving / attendance : 0;

  return {
    totalAttendance: attendance,
    totalGiving: giving,
    avgGivingPerPerson: avgGivingPerPerson.toFixed(2)
  };
};

const epochWeeks = (inputDate) => {
  const baseDate = new Date(1970, 0, 4); // Jan 4, 1970
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
  const diffMs = date - baseDate;
  let finalDate = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

  return finalDate
};

function getCacheKey(options = {}) {
  const parts = [];

  if (options.date) parts.push(`date=${options.date}`);
  if (options.week_reference) parts.push(`week=${options.week_reference}`);
  if (options.service_time_ids?.length) parts.push(`service_time_ids=${options.service_time_ids.join(",")}`);

  // Handle category_id (array or single value)
  if (options.category_id) {
    const categories = Array.isArray(options.category_id)
      ? options.category_id
      : options.category_id.toString().split(",").map(Number);

    const sortedCats = categories.map(String).sort(); // ensure consistent string format
    parts.push(`category=${sortedCats.join(",")}`);
  }

  return `church_metrics_records_${parts.join("_")}`;
}

export { formatTimeOfDay, getCacheKey, calculateMetrics, epochWeeks };