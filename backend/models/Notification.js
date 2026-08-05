const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    notification_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    reference_id: { type: String },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
module.exports = mongoose.model("Notification", notificationSchema);
