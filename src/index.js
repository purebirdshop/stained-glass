import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors"; // <--- import cors
import metricsRouter from "./routes/metrics.js";
import connectionRouter from "./routes/connection.js";

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
    origin: [
      "http://localhost:5173",
      "https://viewapse.com",
      "https://www.viewapse.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allow cookies to be sent
  })
);

// --- Middleware ---
app.use(express.json());

// --- Routes ---
app.use("/api/metrics", metricsRouter);
app.use("/api/connection", connectionRouter);

app.get("/", (req, res) => {
  res.send("Middleware running 🤝 use /api/metrics to view the stained glass.");
});

app.listen(PORT, () =>
  console.log(`💎 Server running with sessions on port ${PORT}`)
);
