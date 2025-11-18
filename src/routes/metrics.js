import express from "express";
import { 
  getCampus,
  getCampuses,
  getServiceTimes, 
  getRecords, 
  getAllRecords,
  verifyCmUserByEmail,
  getAllRecordsByCampus,
  getAllRecordsByCampusByCategory,
  getAllRecordsByCampusGrouped,
} from "../services/churchService.js";
import { 
  fetchCampusProfile,
  fetchCampusList
} from "../services/ccbService.js";
import mergeCampusLists from "../utils/mergeCampusLists.js"

const router = express.Router();

router.get("/", async (req, res) => {
  try {

    // 6️⃣ Return service times and filtered records
    return `Welcome to stained glass.`;
    // return `<h1>Welcome to stained glass.</h1><img src="https://images.unsplash.com/photo-1550541231-56ddb7f844ec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2572" /> `;
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching filtered records:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch filtered records" });
  }
});

router.get("/all-records", async (req, res) => {
  try {
    const { campus_id } = req.query;

    if (!campus_id) {
      return res.status(400).json({ error: "Missing 'campus_id' query param" });
    }

    // 5️⃣ Fetch records for the given month / date and service_time_ids
    const recordsData = await getAllRecords({
      campus_id
    });

    // 6️⃣ Return service times and filtered records
    return res.json({
      records: recordsData
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching filtered records:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch filtered records" });
  }
});

router.get("/all-records-by-campus", async (req, res) => {
  try {
    const { campus_id } = req.query;

    if (!campus_id) {
      return res.status(400).json({ error: "Missing 'campus_id' query param" });
    }

    // 5️⃣ Fetch records for the given month / date and service_time_ids
    const recordsData = await getAllRecordsByCampus({
      campus_id
    });

    // 6️⃣ Return service times and filtered records
    return res.json({
      records: recordsData
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching filtered records:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch filtered records" });
  }
});

router.get("/all-records-by-campus-grouped", async (req, res) => {
  try {
    const { campus_id, startDate, endDate } = req.query;

    if (!campus_id) {
      return res.status(400).json({ error: "Missing 'campus_id' query param" });
    }

    // 5️⃣ Fetch records for the given month / date range
    const records = await getAllRecordsByCampusGrouped({
      campus_id,
      start_date: startDate,
      end_date: endDate
    });

    // 6️⃣ Return records
    return res.json({ records });
  } catch (err) {
    console.error(
      "[ metrics.js ] | Error fetching filtered records:",
      err.message
    );
    return res
      .status(500)
      .json({ error: "[ metrics.js ] | Failed to fetch filtered records" });
  }
});

router.get("/all-records-by-campus-by-category", async (req, res) => {
  try {
    const { campus_id } = req.query;

    if (!campus_id) {
      return res.status(400).json({ error: "Missing 'campus_id' query param" });
    }

    // id = campus_id.campus_id;

    // 5️⃣ Fetch records for the given month / date and service_time_ids
    const recordsData = await getAllRecordsByCampusByCategory({
      campus_id,
    });

    // 6️⃣ Return service times and filtered records
    return res.json({
      records: recordsData
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching filtered records:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch filtered records" });
  }
});

router.get("/verify-user", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Missing 'email' query parameter" });
    }

    const userData = await verifyCmUserByEmail(email);

    if (!userData) {
      return res.status(404).json({ error: `No user found for email: ${email}` });
    }

    // ✅ Store user in session
    req.session.churchUser = userData;

    return res.json({
      message: "🏅 User successfully verified.",
      user: userData,
    });

  } catch (err) {
    console.error("Error verifying user:", err.message);
    return res.status(500).json({ error: "Failed to verify user" });
  }
});

// GET /api/metrics/filtered-records?campus_id=65637&date=YYYY-MM-DD&time=830
router.get("/filtered-records", async (req, res) => {
  const sessionUser = req.session?.churchUser;
  
  try {
    let { campus_id, date, time, category } = req.query;

    if (!campus_id) {
      if (!sessionUser) {
        return res.status(400).json({
          error: "Missing 'campus_id' in query params or user session.",
        });
      } else {
        campus_id = req.session.churchUser.campus_id;
      }
    }

    const serviceTimes = await getServiceTimes();

    let filteredServiceTimes = serviceTimes.filter(
      st =>
        st.campus?.id.toString() === campus_id.toString() &&
        (st.day_of_week === 0 || st.day_of_week === 3)
    );

    if (time) {
      const formattedTime = time.toString().padStart(4, "0");
      const hour = formattedTime.slice(0, 2);
      const minute = formattedTime.slice(2, 4);
      const targetTimeOfDay = `2000-01-01T${hour}:${minute}:00.000Z`;

      filteredServiceTimes = filteredServiceTimes.filter(
        st => st.time_of_day === targetTimeOfDay
      );
    }

    const serviceTimeJSON = filteredServiceTimes.map(st => ({
      service_time_id: st.id,
      time_of_day: st.time_of_day,
      day_of_week: st.day_of_week,
    }));

    const recordsData = await getRecords({
      date,
      service_time_ids: serviceTimeJSON.map(st => st.service_time_id),
      category_id: category, // <-- pass category filter here
    });

    return res.json({
      serviceTimes: serviceTimeJSON,
      records: recordsData,
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching filtered records:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch filtered records" });
  }
});

router.get("/metrics-campus", async (req, res) => {
  let { id } = req.query;

  if(!id){
    console.log("[ metrics.js ] | Failed to fetch records, no campus ID provided.");
  }

  try {
    // 5️⃣ Fetch records from CCB's API
    const recordsData = await getCampus({
      id
    });

    return res.json({
      recordsData
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching records from CCB's API:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch records from CCB Data." });
  }
});

router.get("/ccb-campus", async (req, res) => {
  let { id } = req.query;

  if(!id){
    console.log("[ metrics.js ] | Failed to fetch records, no campus ID provided.");
  }

  try {
    // 5️⃣ Fetch records from CCB's API
    const recordsData = await fetchCampusProfile({
      id
    });

    return res.json({
      recordsData
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching records from CCB's API:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch records from CCB Data." });
  }
});

router.get("/metrics-campus-list", async (req, res) => {
  try {
    // 5️⃣ Fetch records from CCB's API
    const recordsData = await getCampuses();

    return res.json(recordsData);
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching records from CCB's API:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch records from CCB Data." });
  }
});

router.get("/ccb-campus-list", async (req, res) => {
  try {
    // 5️⃣ Fetch records from CCB's API
    const recordsData = await fetchCampusList();

    return res.json(recordsData);
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching records from CCB's API:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch records from CCB Data." });
  }
});

router.get("/all-campus-data", async (req, res) => {
  try {
    // 5️⃣ Fetch records from CCB's API
    const metricsResponse = await getCampuses();
    const ccbResponse = await fetchCampusList();
    const metrics = metricsResponse; 
    const ccb = ccbResponse?.ccb_api.response.campuses.campus; 

    const recordsData = mergeCampusLists( metrics,ccb )
    return res.json({
      data:recordsData
    });
  } catch (err) {
    console.error("[ metrics.js ] | Error fetching records from CCB's API:", err.message);
    return res.status(500).json({ error: "[ metrics.js ] | Failed to fetch records from CCB Data." });
  }
});



export default router;
