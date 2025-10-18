export const calculateMetrics = (ccbData, churchData) => {
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
  const baseDate = new Date(1970, 0, 4); // months are 0-indexed in JS
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate);

  // Get difference in milliseconds
  const diffMs = date - baseDate;

  // Convert ms → days → weeks (floor to full weeks)
  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

  return weeks;
}
