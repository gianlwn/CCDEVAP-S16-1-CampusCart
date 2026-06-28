const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema(
  {
    rating_id: { type: String, required: true, unique: true },
    listing_id: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
  },s false },
);
module.exports = mongoose.model("Rating", ratingSchema);