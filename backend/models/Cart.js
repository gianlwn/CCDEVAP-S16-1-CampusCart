const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    listing_id: { type: String, required: true },
    quantity: { type: Number, default: 1 },
  },
  {
    timestamps: { createdAt: "added_at", updatedAt: false },
    versionKey: false,
  },
);

module.exports = mongoose.model("Cart", cartSchema);
