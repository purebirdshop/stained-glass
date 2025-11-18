import express from "express";
import jwt from "jsonwebtoken";
import whitelist from "../data/whitelist.js"; // simple JSON array of emails
import { verifyCmUserByEmail } from "../services/churchService.js";
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "temporary-secret";

router.post("/", async (req, res) => {
  let cmUserData = {};
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  const allowed = whitelist.includes(email.toLowerCase());
  if (!allowed) {
    return res.status(401).json({ success: false, message: "Email not allowed" });
  } else {
    cmUserData = await verifyCmUserByEmail(email);
  }

  // Generate a short-lived JWT (1 hour)
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });

  return res.json({ success: true, token, cmUserData });
});

export default router;
