const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const Claim = require("../models/Claim");
const Report = require("../models/Report");
const Category = require("../models/Category");
const ListingCategory = require("../models/ListingCategory");

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

function monthlyCounts(dates, year) {
  const counts = new Array(12).fill(0);
  dates.forEach((d) => {
    const date = new Date(d);
    if (date.getFullYear() === year) counts[date.getMonth()]++;
  });
  return counts;
}

router.get("/dashboard", async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const [users, listings, completedClaims, reports, categories, lcLinks] =
      await Promise.all([
        User.find({}, "is_suspended is_banned created_at"),
        Listing.find({}, "status"),
        Claim.find({ status: "completed" }, "quantity claim_date"),
        Report.find({}, "created_at"),
        Category.find({ is_removed: false }, "category_id category_name"),
        ListingCategory.find({}, "category_id"),
      ]);

    const userStatus = { active: 0, suspended: 0, banned: 0 };
    users.forEach((u) => {
      if (u.is_banned) userStatus.banned++;
      else if (u.is_suspended) userStatus.suspended++;
      else userStatus.active++;
    });

    const reportsMonthly = monthlyCounts(
      reports.map((r) => r.created_at),
      year,
    );

    const catNameById = Object.fromEntries(
      categories.map((c) => [c.category_id, c.category_name]),
    );
    const catCounts = {};
    lcLinks.forEach((lc) => {
      const name = catNameById[lc.category_id];
      if (!name) return;
      catCounts[name] = (catCounts[name] || 0) + 1;
    });
    const popularCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    const listingsStatus = { approved: 0, pending: 0, rejected: 0 };
    listings.forEach((l) => {
      if (l.status === "active") listingsStatus.approved++;
      else if (l.status === "pending_review") listingsStatus.pending++;
      else if (l.status === "rejected") listingsStatus.rejected++;
    });

    const registrationsMonthly = monthlyCounts(
      users.map((u) => u.created_at),
      year,
    );

    const soldMonthly = new Array(12).fill(0);
    completedClaims.forEach((c) => {
      const date = new Date(c.claim_date);
      if (date.getFullYear() === year) {
        soldMonthly[date.getMonth()] += c.quantity || 1;
      }
    });

    res.json({
      months: MONTH_NAMES,
      userStatus,
      reportsMonthly,
      popularCategories,
      listingsStatus,
      registrationsMonthly,
      soldMonthly,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
