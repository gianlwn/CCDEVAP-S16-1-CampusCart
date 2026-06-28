const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cart_id: { type: String, required: true, unique: true },
    buyer_id: { type: String, required: true },
    listing_id: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    does_exist: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "added_at", updatedAt: false },
    versionKey: false,
  },
);

module.exports = mongoose.model("Cart", cartSchema);
