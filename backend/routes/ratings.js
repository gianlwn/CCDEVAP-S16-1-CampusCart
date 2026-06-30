const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Rating = require("../models/Rating");
const User = require("../models/User");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");
const generateId = require("../utils/generateId");
const createNotification = require("../utils/createNotification");

// GET /api/ratings/seller/:user_id
// Returns all ratings on the seller's listings, enriched with item name, category, and buyer info via rater_id.
router.get("/seller/:user_id", async (req, res) => {
  try {
    const myListings = await Listing.find({ seller_id: req.params.user_id });
    if (!myListings.length) return res.json([]);

    const myListingIds = myListings.map((l) => l.listings_id);
    const listingById = Object.fromEntries(
      myListings.map((l) => [l.listings_id, l]),
    );

    const ratings = await Rating.find({ listing_id: { $in: myListingIds } });
    if (!ratings.length) return res.json([]);

    // Category per listing
    const lcLinks = await ListingCategory.find({
      listing_id: { $in: myListingIds },
    });
    const catIds = [...new Set(lcLinks.map((lc) => lc.category_id))];
    const cats = await Category.find({ category_id: { $in: catIds } });
    const catNameById = Object.fromEntries(
      cats.map((c) => [c.category_id, c.category_name]),
    );
    const listingCatMap = {};
    lcLinks.forEach((lc) => {
      if (!listingCatMap[lc.listing_id])
        listingCatMap[lc.listing_id] = catNameById[lc.category_id] || "Others";
    });

    // Buyer name via rater_id
    const raterIds = [
      ...new Set(ratings.map((r) => r.rater_id).filter(Boolean)),
    ];
    const raters = await User.find({ user_id: { $in: raterIds } });
    const raterNameById = Object.fromEntries(
      raters.map((u) => [u.user_id, `${u.first_name} ${u.last_name}`.trim()]),
    );

    const result = ratings.map((r) => {
      const listing = listingById[r.listing_id];
      return {
        id: r.rating_id,
        rater_id: r.rater_id,
        item: listing ? listing.product_name : "Unknown Item",
        category: listingCatMap[r.listing_id] || "Others",
        buyer: raterNameById[r.rater_id] || "Anonymous",
        date: r.reviewed_at
          ? new Date(r.reviewed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        rating: r.rating,
        review: r.review || "",
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/ratings
router.post("/", async (req, res) => {
  try {
    const { listing_id, rater_id, rating, review } = req.body;
    if (!listing_id || !rater_id || !rating)
      return res.status(400).json({ error: "missing_fields" });

    const listing = await Listing.findOne(
      { listings_id: listing_id },
      "seller_id product_name",
    );
    const rated_user_id = listing ? listing.seller_id : null;

    const rating_id = await generateId(Rating, "rating_id", "rating_id_");
    await new Rating({
      rating_id,
      listing_id,
      rated_user_id,
      rater_id,
      rating: Number(rating),
      review: review || "",
    }).save();

    try {
      if (listing?.seller_id) {
        const rater = await User.findOne(
          { user_id: rater_id },
          "first_name last_name",
        );
        const raterName = rater
          ? `${rater.first_name} ${rater.last_name}`.trim()
          : "A buyer";
        createNotification(
          listing.seller_id,
          "new_review",
          `${raterName} left a review on "${listing.product_name}"`,
          rating_id,
        ).catch(() => {});
      }
    } catch (_) {}

    res.status(201).json({ rating_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/ratings/:id
router.put("/:id", async (req, res) => {
  try {
    const { rating, review } = req.body;
    const update = {};
    if (rating !== undefined) update.rating = Number(rating);
    if (review !== undefined) update.review = review;

    const updated = await Rating.findOneAndUpdate(
      { rating_id: req.params.id },
      update,
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json({ rating_id: updated.rating_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
