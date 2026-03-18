import express from "express";
import { generatePermissionLetter, getEventsForRoll } from "../controllers/permissionLetter.js";

const router = express.Router();

router.post("/permission-letter", generatePermissionLetter);
router.get("/events-for-roll",    getEventsForRoll);

export default router;
