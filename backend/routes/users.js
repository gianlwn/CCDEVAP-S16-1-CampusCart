const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const Claim = require("../models/Claim");
const Rating = require("../models/Rating");

// GET /api/users/:user_id
router.get("/:user_id", async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) return res.status(404).json({ error: "not_found" });

    const itemsSold = await Claim.countDocuments({
      seller_id: user.user_id,
      status: "completed",
    });

    const listings = await Listing.find({ seller_id: user.user_id });
    const listingIds = listings.map((l) => l.listings_id);

    let avgRating = null;
    if (listingIds.length > 0) {
      const ratings = await Rating.find({ listing_id: { $in: listingIds } });
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = Math.round((sum / ratings.length) * 10) / 10;
      }
    }

    const memberSince = user.created_at
      ? new Date(user.created_at).getFullYear().toString()
      : "—";

    res.json({
      user_id: user.user_id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      school: user.school || "",
      rating: avgRating,
      itemsSold,
      memberSince,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
