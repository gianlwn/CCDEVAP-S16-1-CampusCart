const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    course_code: { type: String },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    profile_picture: { type: String, default: "default_pfp.jpg" },
    warning_count: { type: Number, default: 0 },
    is_suspended: { type: Boolean, default: false },
    is_banned: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  },
);
module.exports = mongoose.model("User", userSchema);
