const mongoose = require("mongoose");
const claimSchema = new mongoose.Schema(
  {
    claim_id: { type: String, required: true, unique: true },
    listing_id: { type: String, required: true },
    buyer_id: { type: String, required: true },
    seller_id: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    buyer_completed: { type: Boolean, default: false },
    seller_completed: { type: Boolean, default: false },
    claim_date: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
module.exports = mongoose.model("Claim", claimSchema);
