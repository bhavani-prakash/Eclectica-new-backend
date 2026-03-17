import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendConfirmationEmail = async (to, name, event, paymentStatus) => {
  const isFree = paymentStatus === "free";

  const msg = {
    to,
    from: process.env.SENDGRID_FROM,
    subject: `Registration ${isFree ? "Confirmed" : "Received"} – ${event} | ECLECTICA 2K26`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0a1628;color:#fff;border-radius:10px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#d4af37,#f4d03f);padding:24px;text-align:center;">
          <h1 style="margin:0;color:#0a1628;font-size:24px;letter-spacing:3px;">ECLECTICA 2K26</h1>
          <p style="margin:4px 0 0;color:#0a1628;font-size:13px;">ECE Department · MITS Deemed University</p>
        </div>
        <div style="padding:28px 32px;">
          <h2 style="color:#f4d03f;margin-top:0;">Hello ${name}! 👋</h2>
          <p>You have successfully registered for <strong style="color:#f4d03f;">${event}</strong> at ECLECTICA 2K26.</p>
          ${isFree
            ? `<p style="color:#4ade80;font-weight:bold;">✅ Debate is a free event — no payment needed!</p>`
            : `<p style="color:#fbbf24;">⏳ Your payment screenshot is under review. We'll confirm once verified.</p>`
          }
          <div style="background:rgba(255,255,255,0.07);border-left:3px solid #d4af37;padding:16px;margin:20px 0;border-radius:6px;">
            <p style="margin:0 0 6px;">📅 <strong>Date:</strong> April 1, 2026</p>
            <p style="margin:0 0 6px;">📍 <strong>Venue:</strong> MITS — Lakshmi Block, Madanapalle</p>
            <p style="margin:0;">🎯 <strong>Event:</strong> ${event}</p>
          </div>
          <p style="color:#aaa;font-size:13px;">Questions? Call us at +91 8125035960</p>
          <p style="color:#666;font-size:12px;margin-top:16px;border-top:1px solid rgba(255,255,255,0.1);padding-top:14px;">
            ⚠️ Check your spam folder if you don't see this email.
          </p>
        </div>
        <div style="background:rgba(0,0,0,0.25);padding:12px;text-align:center;">
          <p style="margin:0;color:#555;font-size:11px;">© 2026 ECLECTICA — ECE Dept, MITS Deemed University</p>
        </div>
      </div>`,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent to", to);
    return { success: true };
  } catch (err) {
    console.error("❌ Email failed:", err.response?.body || err.message);
    return { success: false };
  }
};
