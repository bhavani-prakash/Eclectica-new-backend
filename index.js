import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import registrationRouter from "./src/routes/registration.js";
import adminRouter from "./src/routes/admin.js";
import permissionRouter from "./src/routes/permissionLetter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app        = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", registrationRouter);
app.use("/api", permissionRouter);
app.use("/admin", adminRouter);

app.get("/", (_req, res) => res.json({ message: "ECLECTICA 2K26 API ✅" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(Number(process.env.PORT) || 5000, () =>
      console.log(`🚀 Running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error("❌ MongoDB error:", err.message); process.exit(1); });
