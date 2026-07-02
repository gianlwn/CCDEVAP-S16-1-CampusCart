const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema(
  {
    listings_id: { type: String, required: true, unique: true },
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "pending_review", "rejected"],
      default: "pending_review",
    },
    condition: { type: String, enum: ["New", "Good", "Used"], required: true },
    seller_id: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    images: [{ type: String }],
    quantity: { type: Number, default: 1 },
    created: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
  },
  { versionKey: false },
);
module.exports = mongoose.model("Listing", listingSchema);
