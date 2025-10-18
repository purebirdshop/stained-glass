import express from "express";
import dotenv from "dotenv";
import metricsRouter from "./routes/metrics.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use("/api/metrics", metricsRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
