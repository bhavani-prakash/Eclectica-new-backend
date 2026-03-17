import Registration from "../models/Registration.js";
import { sendConfirmationEmail } from "../utils/email.js";

export const EVENT_FEES = {
  "Tech Quiz": 70, "Bug Hunters": 70, "Circuit Detective": 70,
  "Paper Presentation": 70, "Poster Presentation": 70,
  "Project Expo": 100, "Debate": 0,
  "Free Fire": 200, "BGMI": 200,
  "cineQuest": 50, "Balloon Spirit": 50, "Rope Rumble": 50, "Ball Heist": 50,
};

const norm = v => (typeof v === "string" ? v.trim() : "");
const escRe = v => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const resolveEvent = raw => {
  const r = norm(raw);
  return Object.keys(EVENT_FEES).find(k => k.toLowerCase() === r.toLowerCase()) || "";
};

// POST /api/register
export const register = async (req, res) => {
  try {
    const name           = norm(req.body?.name);
    const email          = norm(req.body?.email);
    const college        = norm(req.body?.college);
    const rollnumber     = norm(req.body?.rollnumber);
    const contactnumber  = norm(req.body?.contactnumber);
    const whatsappnumber = norm(req.body?.whatsappnumber);
    const year           = norm(req.body?.year);
    const department     = norm(req.body?.department);
    const eventType      = norm(req.body?.eventType);
    const event          = resolveEvent(req.body?.event);
    const utrNumber      = norm(req.body?.utrNumber);

    if (!name || !email || !college || !rollnumber || !contactnumber ||
        !whatsappnumber || !year || !department || !eventType) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address." });
    }
    if (!event) {
      return res.status(400).json({ success: false, message: "Invalid event selected." });
    }

    const isFree = EVENT_FEES[event] === 0;

    if (!isFree && !req.file) {
      return res.status(400).json({ success: false, message: "Please upload payment screenshot." });
    }
    if (!isFree && !utrNumber) {
      return res.status(400).json({ success: false, message: "Please enter UTR / reference number." });
    }

    // Duplicate check
    const exists = await Registration.findOne({
      rollnumber: { $regex: `^${escRe(rollnumber)}$`, $options: "i" }, event,
    });
    if (exists) {
      return res.status(200).json({ success: true, alreadyRegistered: true,
        message: "You are already registered for this event." });
    }

    let imageUrl = null;
    if (!isFree && req.file) {
      imageUrl = /^https?:\/\//i.test(req.file.path || "")
        ? req.file.path
        : `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const reg = await Registration.create({
      name, email, college, rollnumber, contactnumber, whatsappnumber,
      year, department, eventType, event,
      paymentAmount: EVENT_FEES[event],
      paymentStatus: isFree ? "free" : "pending",
      utrNumber: isFree ? null : utrNumber,
      imageUrl,
    });

    sendConfirmationEmail(email, name, event, reg.paymentStatus)
      .catch(e => console.error("Email error:", e.message));

    return res.status(201).json({
      success: true,
      message: isFree
        ? "Registered successfully! Debate is free — see you there 🎉"
        : "Registration submitted! Your payment will be verified shortly. Check your email.",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};
