function formatTimeOfDay(timeStr){
  // Ensure string, zero-pad hour/minute
  const str = timeStr.toString();
  const hour = str.slice(0, 2);
  const minute = str.slice(2, 4);

  return `2000-01-01T${hour}:${minute}:00.000Z`;
};

function calculateMetrics(ccbData, churchData){
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

function epochWeeks(inputDate) {
  const baseDate = new Date(Date.UTC(1970, 0, 4)); // force UTC
  const date = inputDate instanceof Date
    ? new Date(Date.UTC(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate()
      ))
    : new Date(inputDate + "T00:00:00Z"); // force UTC midnight

  const diffMs = date - baseDate;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
}

function getMetricsCacheKey(options = {}) {
  const parts = [];

  if (options.id) parts.push(`id=${options.id}`);
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


function getCcbCacheKey(options = {}) {
  const parts = [];

  if (options.id) parts.push(`id=${options.id}`);
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

  return `ccb_church_records_${parts.join("_")}`;
}
const calculateTotal = (recordsArray) => {
  
  if (!Array.isArray(recordsArray) || recordsArray.length === 0) return 0;
  return recordsArray.reduce((sum, record) => sum + (record.value || 0), 0);
};




export { calculateTotal, formatTimeOfDay, getMetricsCacheKey, getCcbCacheKey, calculateMetrics, epochWeeks };