function mergeCampusLists(metricsCampuses = [], ccbCampuses = []) {
  // Ensure ccbCampuses is a proper array
  const ccbArray = Array.isArray(ccbCampuses) ? ccbCampuses : [];
  const metricsArray = Array.isArray(metricsCampuses) ? metricsCampuses : [];

  // Helper to normalize strings for matching
  const normalize = (s) => (s ? s.trim().toLowerCase() : '');

  return metricsArray.map(metric => {
    const metricName = metric.slug || '';
    const metricNorm = normalize(metricName);

    // Find matching CCB campus by name
    const match = ccbArray.find(ccb => normalize(ccb.name) === metricNorm);

    return {
      name: metricName,      // Metrics name is primary
      metrics: metric,       // full Metrics object
      ccb: match || null     // full CCB object or null if not found
    };
  });
}

export default mergeCampusLists;