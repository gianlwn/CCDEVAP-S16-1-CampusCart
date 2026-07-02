const express = require("express");
const router = express.Router();
const Claim = require("../models/Claim");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Rating = require("../models/Rating");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");
const createNotification = require("../utils/createNotification");

async function enrichWithListingAndCategory(claims, idField) {
  const listingIds = [...new Set(claims.map((c) => c.listing_id))];
  const [listings, lcLinks] = await Promise.all([
    Listing.find({ listings_id: { $in: listingIds } }),
    ListingCategory.find({ listing_id: { $in: listingIds } }),
  ]);
  const listingById = Object.fromEntries(
    listings.map((l) => [l.listings_id, l]),
  );
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
  return { listingById, listingCatMap };
}

router.get("/", async (req, res) => {
  try {
    const { buyer_id, seller_id } = req.query;
    if (!buyer_id && !seller_id)
      return res.status(400).json({ error: "buyer_id or seller_id required" });

    if (seller_id) {
      const claims = await Claim.find({
        seller_id,
        status: { $ne: "cancelled" },
      }).sort({ claim_date: -1 });
      if (!claims.length) return res.json([]);

      const { listingById, listingCatMap } =
        await enrichWithListingAndCategory(claims);
      const buyerIds = [...new Set(claims.map((c) => c.buyer_id))];
      const buyers = await User.find({ user_id: { $in: buyerIds } });
      const buyerNameById = Object.fromEntries(
        buyers.map((u) => [u.user_id, `${u.first_name} ${u.last_name}`.trim()]),
      );

      return res.json(
        claims.map((c) => {
          const listing = listingById[c.listing_id];
          return {
            id: c.claim_id,
            listing_id: c.listing_id,
            name: listing ? listing.product_name : "Unknown Item",
            price: listing ? `₱${Number(listing.price).toLocaleString()}` : "—",
            category: listingCatMap[c.listing_id] || "Others",
            buyer: buyerNameById[c.buyer_id] || "Buyer",
            buyer_id: c.buyer_id,
            date: new Date(c.claim_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: c.status,
            quantity: c.quantity ?? 1,
            buyer_completed: c.buyer_completed,
            seller_completed: c.seller_completed,
          };
        }),
      );
    }

    const claims = await Claim.find({
      buyer_id,
      status: { $ne: "cancelled" },
    }).sort({ claim_date: -1 });
    if (!claims.length) return res.json([]);

    const { listingById, listingCatMap } =
      await enrichWithListingAndCategory(claims);
    const sellerIds = [
      ...new Set(Object.values(listingById).map((l) => l.seller_id)),
    ];
    const sellers = await User.find({ user_id: { $in: sellerIds } });
    const sellerNameById = Object.fromEntries(
      sellers.map((u) => [u.user_id, `${u.first_name} ${u.last_name}`.trim()]),
    );
    const sellerContactById = Object.fromEntries(
      sellers.map((u) => [
        u.user_id,
        { email: u.email || "", contact_number: u.contact_number || "" },
      ]),
    );

    const listingIds = claims.map((c) => c.listing_id);
    const ratings = await Rating.find({
      listing_id: { $in: listingIds },
      rater_id: buyer_id,
    });
    const ratingByListing = Object.fromEntries(
      ratings.map((r) => [r.listing_id, r]),
    );

    return res.json(
      claims.map((c) => {
        const listing = listingById[c.listing_id];
        const existingRating = ratingByListing[c.listing_id];
        return {
          id: c.claim_id,
          listing_id: c.listing_id,
          rating_id: existingRating ? existingRating.rating_id : null,
          name: listing ? listing.product_name : "Unknown Item",
          price: listing ? `₱${Number(listing.price).toLocaleString()}` : "—",
          category: listingCatMap[c.listing_id] || "Others",
          seller: sellerNameById[listing?.seller_id] || "Campus Seller",
          seller_id: listing?.seller_id || "",
          seller_email: sellerContactById[listing?.seller_id]?.email || "",
          seller_contact: sellerContactById[listing?.seller_id]?.contact_number || "",
          location: listing?.location || "",
          date: new Date(c.claim_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: c.status,
          quantity: c.quantity ?? 1,
          buyer_completed: c.buyer_completed,
          seller_completed: c.seller_completed,
          userRating: existingRating ? existingRating.rating : null,
          userComment: existingRating ? existingRating.review || "" : null,
        };
      }),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:id/buyer-complete", async (req, res) => {
  try {
    const claim = await Claim.findOne({ claim_id: req.params.id });
    if (!claim) return res.status(404).json({ error: "not_found" });
    claim.buyer_completed = true;
    if (claim.seller_completed) {
      claim.status = "completed";
      await Listing.findOneAndUpdate(
        { listings_id: claim.listing_id },
        { $inc: { quantity: -(claim.quantity ?? 1) } },
      );
    }
    await claim.save();

    if (claim.status === "completed") {
      try {
        const listing = await Listing.findOne(
          { listings_id: claim.listing_id },
          "product_name",
        );
        const itemName = listing ? listing.product_name : "an item";
        await createNotification(
          claim.buyer_id,
          "transaction_complete",
          `Transaction for "${itemName}" is now complete!`,
          claim.claim_id,
        ).catch(() => {});
        await createNotification(
          claim.seller_id,
          "transaction_complete",
          `Transaction for "${itemName}" is now complete!`,
          claim.claim_id,
        ).catch(() => {});
      } catch (_) {}
    }

    res.json({
      claim_id: claim.claim_id,
      status: claim.status,
      buyer_completed: claim.buyer_completed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:id/seller-complete", async (req, res) => {
  try {
    const claim = await Claim.findOne({ claim_id: req.params.id });
    if (!claim) return res.status(404).json({ error: "not_found" });
    claim.seller_completed = true;
    if (claim.buyer_completed) {
      claim.status = "completed";
      await Listing.findOneAndUpdate(
        { listings_id: claim.listing_id },
        { $inc: { quantity: -(claim.quantity ?? 1) } },
      );
    }
    await claim.save();

    try {
      const listing = await Listing.findOne(
        { listings_id: claim.listing_id },
        "product_name",
      );
      const itemName = listing ? listing.product_name : "an item";
      if (claim.status === "completed") {
        await createNotification(
          claim.buyer_id,
          "transaction_complete",
          `Transaction for "${itemName}" is now complete!`,
          claim.claim_id,
        ).catch(() => {});
        await createNotification(
          claim.seller_id,
          "transaction_complete",
          `Transaction for "${itemName}" is now complete!`,
          claim.claim_id,
        ).catch(() => {});
      } else {
        await createNotification(
          claim.buyer_id,
          "seller_ready",
          `Your item "${itemName}" is ready for pickup!`,
          claim.claim_id,
        ).catch(() => {});
      }
    } catch (_) {}

    res.json({
      claim_id: claim.claim_id,
      status: claim.status,
      seller_completed: claim.seller_completed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const claim = await Claim.findOne({ claim_id: req.params.id });
    if (!claim) return res.status(404).json({ error: "not_found" });
    if (claim.status === "completed") {
      return res.status(403).json({ error: "already_completed" });
    }
    if (claim.seller_completed) {
      return res.status(403).json({ error: "seller_confirmed" });
    }

    claim.status = "cancelled";
    await claim.save();

    try {
      const listing = await Listing.findOne(
        { listings_id: claim.listing_id },
        "product_name",
      );
      const itemName = listing ? listing.product_name : "an item";
      await createNotification(
        claim.buyer_id,
        "claim_cancelled",
        `Claim for "${itemName}" was cancelled.`,
        claim.claim_id,
      ).catch(() => {});
      await createNotification(
        claim.seller_id,
        "claim_cancelled",
        `Claim for "${itemName}" was cancelled.`,
        claim.claim_id,
      ).catch(() => {});
    } catch (_) {}

    res.json({ success: true, claim_id: claim.claim_id, status: claim.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
