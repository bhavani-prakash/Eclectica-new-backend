import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Registration from "../models/Registration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOGO_PATH  = path.join(__dirname, "../../assets/Eclectica-logo-nobg.png");

// A4 dimensions in points
const A4_W = 595.28;
const A4_H = 841.89;

// POST /api/permission-letter
export const generatePermissionLetter = async (req, res) => {
  try {
    const rollnumber = (req.body?.rollnumber || "").trim();
    const event      = (req.body?.event      || "").trim();

    if (!rollnumber || !event) {
      return res.status(400).json({ success: false, message: "Roll number and event are required." });
    }

    // Find registration
    const reg = await Registration.findOne({
      rollnumber: { $regex: `^${rollnumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      event:      { $regex: `^${event.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,      $options: "i" },
    });

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "No registration found for this roll number and event. Please check and try again.",
      });
    }
    if(event == "debate" || event == "Debate"){
        return res.status(400).json({
            success: false,
            message: "We can't provide the permission letter for the debate event. We provide that on the event day. Please contact event coordinators for any queries.",
            });

    }

    // Generate QR code as base64 PNG
    const qrData = JSON.stringify({
      name:       reg.name,
      rollnumber: reg.rollnumber,
      college:    reg.college,
      event:      reg.event,
      department: reg.department,
      year:       reg.year,
      status:     reg.paymentStatus,
      verified:   "ECLECTICA 2K26",
    });
    const qrDataUrl = await QRCode.toDataURL(qrData, { width: 150, margin: 1 });
    const qrBuffer  = Buffer.from(qrDataUrl.split(",")[1], "base64");

    // ── Build PDF ────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: "A4", margins: { top: 60, left: 65, right: 65, bottom: 60 } });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="PermissionLetter_${reg.rollnumber}_${reg.event.replace(/\s+/g, "_")}.pdf"`
    );
    doc.pipe(res);

    // ── Watermark logo (centred, low opacity) ────────────────────────────────
    if (fs.existsSync(LOGO_PATH)) {
      const logoSize = 380;
      doc.save();
      doc.opacity(0.10);
      doc.image(LOGO_PATH, (A4_W - logoSize) / 2, (A4_H - logoSize) / 2 - 40, {
        width: logoSize, height: logoSize,
      });
      doc.restore();
    }

    // ── Header ───────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(18).text("ECLECTICA-2K26", { align: "center" });
    doc.font("Helvetica-Bold").fontSize(14).text("Permission Letter",  { align: "center" });
    doc.moveDown(0.4);

    // Date — right aligned
    doc.font("Helvetica").fontSize(10).text("April 1, 2026", { align: "right" });
    doc.moveDown(1);

    // ── From ─────────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(11).text("From:");
    doc.font("Helvetica").fontSize(10)
      .text("The Coordinators")
      .text("ECLECTICA 2K26")
      .text("Department of Electronics and Communication Engineering")
      .text("MITS Deemed to be University")
      .text("Madanapalle");
    doc.moveDown(0.8);

    // ── To ───────────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(11).text("To:");
    doc.font("Helvetica").fontSize(10)
      .text("The Head of the Department")
      .text(`Department of ${reg.department || "_______________"}`)
      .text(reg.college);
    doc.moveDown(0.8);

    // ── Subject ──────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(11)
      .text("Subject: Request for Permission to Participate in ECLECTICA 2K26");
    doc.moveDown(0.8);

    // ── Body ─────────────────────────────────────────────────────────────────
    doc.font("Helvetica").fontSize(10.5).text("Respected Sir/Madam,");
    doc.moveDown(0.7);

    doc.text(
      "We extend our greetings from the Department of Electronics and Communication Engineering, MITS Deemed to be University.",
      { align: "justify" }
    );
    doc.moveDown(0.6);

    doc.text(
      `This is to inform you that ${reg.name} (${reg.rollnumber}), a student of your esteemed institution, has registered for the event ${reg.event} to be conducted as part of ECLECTICA 2K26, our departmental technical symposium.`,
      { align: "justify" }
    );
    doc.moveDown(0.6);

    doc.text(
      "In this regard, we kindly request you to grant permission to participate in the above-mentioned event. We assure you that the program will be conducted in a well-organized and disciplined manner. Participation in this event will provide valuable technical exposure and contribute to the academic and professional development.",
      { align: "justify" }
    );
    doc.moveDown(0.6);

    doc.text("We shall be grateful for your kind consideration and approval.", { align: "justify" });
    doc.moveDown(0.8);
    doc.text("Thanking you.");
    doc.moveDown(0.8);
    doc.text("Yours sincerely,");
    doc.moveDown(1.4);

    // ── Signature block (left) ───────────────────────────────────────────────
    const sigY = doc.y;
    doc.font("Helvetica").fontSize(10)
      .text("The Coordinators", 65, sigY)
      .text("ECLECTICA 2K26",   65)
      .text("Department of ECE",65)
      .text("MITS Deemed to be University", 65)
      .text("Madanapalle",      65);

    // ── HOD block (right) ────────────────────────────────────────────────────
    doc.font("Helvetica").fontSize(10)
      .text("Head of the Department",            350, sigY + 60, { width: 180, align: "center" })
      .text(`Department of ${reg.department || "ECE"}`, 350, sigY + 74, { width: 180, align: "center" });

    // ── QR code (bottom left) ────────────────────────────────────────────────
    const qrY = A4_H - 180;
    doc.image(qrBuffer, 65, qrY, { width: 90, height: 90 });
    doc.font("Helvetica").fontSize(8)
      .text("Scan to verify registration", 55, qrY + 95, { width: 110, align: "center" });

    doc.end();
  } catch (err) {
    console.error("Permission letter error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate permission letter." });
    }
  }
};

// GET /api/events-for-roll  — returns events registered by a roll number (for dropdown)
export const getEventsForRoll = async (req, res) => {
  try {
    const rollnumber = (req.query?.rollnumber || "").trim();
    if (!rollnumber) return res.status(400).json({ success: false, message: "Roll number required." });

    const regs = await Registration.find({
      rollnumber: { $regex: `^${rollnumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    }).select("event paymentStatus");

    if (!regs.length) {
      return res.status(404).json({ success: false, message: "No registrations found for this roll number." });
    }

    res.json({ success: true, events: regs.map(r => ({ event: r.event, status: r.paymentStatus })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
