import express from "express";
import { login, dashboard, verifyPayment } from "../controllers/admin.js";

const router = express.Router();
router.post("/login", login);
router.get("/dashboard", dashboard);
router.put("/verify/:id", verifyPayment);
export default router;
