import express from "express";
import { 
  getServiceTimes, 
  getRecords, 
  getAllRecords,
  verifyUserByEmail
} from "../services/churchService.js";

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

// GET /api/metrics/verify-user?email=user@example.com
router.get("/verify-user", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Missing 'email' query parameter" });
    }

    const userData = await verifyUserByEmail(email);

    if (!userData) {
      return res.status(404).json({ error: `No user found for email: ${email}` });
    }

    // ✅ Store user in session
    req.session.churchUser = userData;

    console.log(`🏅 User successfully verified.`);
    console.log(userData);

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

export default router;
