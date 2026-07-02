const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Claim = require("../models/Claim");
const Rating = require("../models/Rating");
const Cart = require("../models/Cart");

router.get("/:user_id", async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) return res.status(404).json({ error: "not_found" });

    const [itemsSold, activeListings, listings] = await Promise.all([
      Claim.countDocuments({ seller_id: user.user_id, status: "completed" }),
      Listing.countDocuments({ seller_id: user.user_id, status: "active" }),
      Listing.find({ seller_id: user.user_id }, "listings_id"),
    ]);

    const listingIds = listings.map((l) => l.listings_id);
    let avgRating = null;
    if (listingIds.length) {
      const ratings = await Rating.find({ listing_id: { $in: listingIds } });
      if (ratings.length) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = Math.round((sum / ratings.length) * 10) / 10;
      }
    }

    const memberSince = user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "—";

    res.json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      contact_number: user.contact_number || "",
      bio: user.bio || "",
      school: user.school || "",
      course_code: user.course_code || "",
      rating: avgRating,
      itemsSold,
      activeListings,
      memberSince,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.put("/:user_id", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      contact_number,
      bio,
      school,
      course_code,
      password,
    } = req.body;
    const update = {};
    if (first_name !== undefined) update.first_name = first_name;
    if (last_name !== undefined) update.last_name = last_name;
    if (contact_number !== undefined) update.contact_number = contact_number;
    if (bio !== undefined) update.bio = bio;
    if (school !== undefined) update.school = school;
    if (course_code !== undefined) update.course_code = course_code;
    if (password) update.password_hash = await bcrypt.hash(password, 10);

    const updated = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      update,
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json({ user_id: updated.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ error: "not_found" });

    const listings = await Listing.find({ seller_id: user_id }, "listings_id");
    const listingIds = listings.map((l) => l.listings_id);

    await Promise.all([
      User.deleteOne({ user_id }),
      Listing.deleteMany({ seller_id: user_id }),
      Cart.deleteMany({ buyer_id: user_id }),
      Rating.deleteMany({ rater_id: user_id }),
      ...(listingIds.length
        ? [Rating.deleteMany({ listing_id: { $in: listingIds } })]
        : []),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
