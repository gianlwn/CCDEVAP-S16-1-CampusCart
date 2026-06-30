const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Claim = require("../models/Claim");
const Rating = require("../models/Rating");
const Report = require("../models/Report");
const Cart = require("../models/Cart");
const ListingCategory = require("../models/ListingCategory");
const Category = require("../models/Category");

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function last6Months() {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()],
    });
  }
  return result;
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

// GET /api/dashboard?user_id=xxx
router.get("/", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const months = last6Months();
    const monthMap = Object.fromEntries(
      months.map((m) => [`${m.year}-${m.month}`, m.label]),
    );

    // --- seller's listings ---
    const myListings = await Listing.find({ seller_id: user_id });
    const myListingIds = myListings.map((l) => l.listings_id);
    const priceById = Object.fromEntries(
      myListings.map((l) => [l.listings_id, l.price]),
    );

    // --- completed claims as seller ---
    const soldClaims = await Claim.find({
      seller_id: user_id,
      status: "completed",
    });

    // --- KPIs ---
    const totalListings = myListings.length;
    const itemsSold = soldClaims.reduce((s, c) => s + (c.quantity || 1), 0);
    const totalEarnings = soldClaims.reduce(
      (s, c) => s + (priceById[c.listing_id] || 0) * (c.quantity || 1),
      0,
    );

    const myRatings = await Rating.find({ listing_id: { $in: myListingIds } });
    const avgRating = myRatings.length
      ? parseFloat(
          (
            myRatings.reduce((s, r) => s + r.rating, 0) / myRatings.length
          ).toFixed(1),
        )
      : 0;

    const openReports = await Report.countDocuments({
      reported_listing_id: { $in: myListingIds },
      status: "pending",
    });

    // --- sellerRatingHistory: monthly avg rating of listings sold that month ---
    const ratingByListing = {};
    myRatings.forEach((r) => {
      (ratingByListing[r.listing_id] ??= []).push(r.rating);
    });

    const claimsByMonth = Object.fromEntries(
      months.map((m) => [`${m.year}-${m.month}`, []]),
    );
    soldClaims.forEach((c) => {
      const key = monthKey(c.claim_date);
      if (claimsByMonth[key]) claimsByMonth[key].push(c.listing_id);
    });

    const sellerRatingHistory = months.map((m) => {
      const key = `${m.year}-${m.month}`;
      let sum = 0,
        count = 0;
      claimsByMonth[key].forEach((lid) => {
        (ratingByListing[lid] || []).forEach((r) => {
          sum += r;
          count++;
        });
      });
      return {
        month: m.label,
        rating: count ? parseFloat((sum / count).toFixed(1)) : 0,
      };
    });

    // --- itemsSoldMonthly & earningsMonthly ---
    const soldByMonth = Object.fromEntries(
      months.map((m) => [`${m.year}-${m.month}`, 0]),
    );
    const earnByMonth = Object.fromEntries(
      months.map((m) => [`${m.year}-${m.month}`, 0]),
    );
    soldClaims.forEach((c) => {
      const key = monthKey(c.claim_date);
      if (key in soldByMonth) {
        const qty = c.quantity || 1;
        soldByMonth[key] += qty;
        earnByMonth[key] += (priceById[c.listing_id] || 0) * qty;
      }
    });
    const itemsSoldMonthly = months.map((m) => ({
      month: m.label,
      sold: soldByMonth[`${m.year}-${m.month}`],
    }));
    const earningsMonthly = months.map((m) => ({
      month: m.label,
      amount: earnByMonth[`${m.year}-${m.month}`],
    }));

    // --- listingStatus: breakdown of seller's listings by status ---
    const statusCount = {};
    myListings.forEach((l) => {
      const label =
        l.status === "pending_review"
          ? "Pending Review"
          : l.status === "active"
            ? "Active"
            : l.status === "claimed"
              ? "Claimed"
              : l.status;
      statusCount[label] = (statusCount[label] || 0) + 1;
    });
    const listingStatus = Object.entries(statusCount).map(([label, value]) => ({
      label,
      value,
    }));

    // --- reportsOnListing: seller's listing reports grouped by reason ---
    const myReports = await Report.find({
      reported_listing_id: { $in: myListingIds },
    });
    const reasonCount = {};
    myReports.forEach((r) => {
      reasonCount[r.reason] = (reasonCount[r.reason] || 0) + 1;
    });
    const reportsOnListing = Object.entries(reasonCount).map(
      ([label, value]) => ({ label, value }),
    );

    // --- itemsByCategory: items the user bought (as buyer), grouped by category ---
    const boughtClaims = await Claim.find({
      buyer_id: user_id,
      status: "completed",
    });
    const boughtListingIds = [
      ...new Set(boughtClaims.map((c) => c.listing_id)),
    ];
    const lcLinks = await ListingCategory.find({
      listing_id: { $in: boughtListingIds },
    });
    const catIds = [...new Set(lcLinks.map((lc) => lc.category_id))];
    const categories = await Category.find({ category_id: { $in: catIds } });
    const catNameById = Object.fromEntries(
      categories.map((c) => [c.category_id, c.category_name]),
    );

    const catCount = {};
    lcLinks.forEach((lc) => {
      const name = catNameById[lc.category_id] || "Others";
      catCount[name] = (catCount[name] || 0) + 1;
    });
    const itemsByCategory = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    // --- cartAddsByDay: cart adds on seller's listings, by day of week ---
    const cartItems = await Cart.find({ listing_id: { $in: myListingIds } });
    const dayCount = Object.fromEntries(DAY_NAMES.map((d) => [d, 0]));
    cartItems.forEach((c) => {
      const day = DAY_NAMES[new Date(c.added_at).getDay()];
      dayCount[day]++;
    });
    const cartAddsByDay = DAY_NAMES.map((day) => ({
      day,
      count: dayCount[day],
    }));

    res.json({
      kpi: { totalListings, itemsSold, totalEarnings, avgRating, openReports },
      sellerRatingHistory,
      itemsByCategory,
      reportsOnListing,
      itemsSoldMonthly,
      earningsMonthly,
      cartAddsByDay,
      listingStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
