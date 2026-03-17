import express from "express";
import { register } from "../controllers/registration.js";
import { upload } from "../utils/multer.js";

const router = express.Router();
router.post("/register", upload.single("screenshot"), register);
export default router;
