import Registration from "../models/Registration.js";
import dotenv from "dotenv";
dotenv.config();

// POST /admin/login  — simple password check, no JWT
export const login = (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials." });
};

// GET /admin/dashboard
export const dashboard = async (_req, res) => {
  try {
    const data = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /admin/verify/:id
export const verifyPayment = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndUpdate(
      req.params.id, { paymentStatus: "verified" }, { new: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
