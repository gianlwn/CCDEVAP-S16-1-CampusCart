const mongoose = require("mongoose");

const listingCategorySchema = new mongoose.Schema(
  {
    listing_id: { type: String, required: true },
    category_id: { type: String, required: true },
  },
  { versionKey: false },
);

module.exports = mongoose.model("ListingCategory", listingCategorySchema);
