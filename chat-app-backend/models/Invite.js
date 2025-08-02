const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipientEmail: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  token: { type: String, required: true }, // Unique token for email link
}, { timestamps: true });

module.exports = mongoose.model("Invites", inviteSchema);
