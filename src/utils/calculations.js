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
