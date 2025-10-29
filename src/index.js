import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors"; // <--- import cors
import metricsRouter from "./routes/metrics.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// --- 🧠 Session Middleware Setup ---
app.use(
  session({
    name: "churchmetrics.sid",
    secret: process.env.SESSION_SECRET || "super_secret_key_here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
    },
  })
);

// --- 🛡 CORS Middleware ---
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allow cookies to be sent
  })
);

// --- Middleware ---
app.use(express.json());

// --- Routes ---
app.use("/api/metrics", metricsRouter);

app.get("/", (req, res) => {
  res.send("Middleware running 🤝 Use /api/metrics to fetch Church Metrics data.");
});

app.listen(PORT, () =>
  console.log(`💎 Server running with sessions on port ${PORT}`)
);
