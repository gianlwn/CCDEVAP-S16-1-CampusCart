const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    category_id: { type: String, required: true, unique: true },
    category_name: { type: String, required: true },
    is_removed: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
  },
);
module.exports = mongoose.model("Category", categorySchema);
