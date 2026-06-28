const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    report_id: { type: String, required: true, unique: true },
    reporter_id: { type: String, required: true },
    reported_listing_id: { type: String },
    reported_user_id: { type: String },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    reviewed_by: { type: String, default: null },
    action_taken: { type: String, default: null },
    resolved_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("Report", reportSchema);
