import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true },
  college:         { type: String, required: true },
  rollnumber:      { type: String, required: true },
  contactnumber:   { type: String, required: true },
  whatsappnumber:  { type: String, required: true },
  year:            { type: String, required: true },
  department:      { type: String, required: true },
  eventType:       { type: String, required: true },
  event:           { type: String, required: true },
  paymentAmount:   { type: Number, default: 0 },
  paymentStatus:   { type: String, enum: ["free", "pending", "verified"], default: "pending" },
  utrNumber:       { type: String, default: null },
  imageUrl:        { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("Registration", schema);
