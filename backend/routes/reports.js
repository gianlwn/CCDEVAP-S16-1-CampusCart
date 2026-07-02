const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const User = require("../models/User");
const Listing = require("../models/Listing");
const generateId = require("../utils/generateId");

function toFrontendShape(report, reporterName, subjectText) {
  return {
    reportId: report.report_id,
    reportType: report.reported_listing_id ? "Listing Report" : "User Report",
    reporter: reporterName || "Unknown",
    status: report.status === "resolved" ? "Resolved" : "Pending Review",
    reason: report.reason,
    subject: subjectText,
    date: new Date(report.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  };
}

async function enrichReports(reports) {
  if (!reports.length) return [];

  const reporterIds = [...new Set(reports.map((r) => r.reporter_id))];
  const userIds = [
    ...new Set(reports.filter((r) => r.reported_user_id).map((r) => r.reported_user_id)),
  ];
  const listingIds = [
    ...new Set(
      reports.filter((r) => r.reported_listing_id).map((r) => r.reported_listing_id),
    ),
  ];

  const reporters = await User.find({ user_id: { $in: reporterIds } });
  const reporterMap = {};
  reporters.forEach((u) => {
    reporterMap[u.user_id] = `${u.first_name} ${u.last_name}`.trim();
  });

  const reportedUsers = await User.find({ user_id: { $in: userIds } });
  const userMap = {};
  reportedUsers.forEach((u) => {
    userMap[u.user_id] = `${u.first_name} ${u.last_name}`.trim();
  });

  const listings = await Listing.find({ listings_id: { $in: listingIds } });
  const listingMap = {};
  listings.forEach((l) => {
    listingMap[l.listings_id] = l.product_name;
  });

  return reports.map((r) => {
    const subject = r.reported_listing_id
      ? `Listing: ${listingMap[r.reported_listing_id] || "Unknown Listing"}`
      : `User: ${userMap[r.reported_user_id] || "Unknown User"}`;
    return toFrontendShape(r, reporterMap[r.reporter_id], subject);
  });
}

router.get("/", async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await Report.find(filter).sort({ created_at: -1 });
    const result = await enrichReports(reports);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

const RESOLVE_ACTION_LABELS = {
  warning: "Warning issued",
  suspend: "User suspended",
  ban: "User banned",
  dismiss: "Dismissed",
};

router.patch("/:id/resolve", async (req, res) => {
  try {
    const { action, note, reviewed_by } = req.body;
    if (!Object.keys(RESOLVE_ACTION_LABELS).includes(action)) {
      return res.status(400).json({ error: "invalid_action" });
    }

    const report = await Report.findOne({ report_id: req.params.id });
    if (!report) return res.status(404).json({ error: "not_found" });

    if (report.reported_user_id) {
      if (action === "warning") {
        await User.findOneAndUpdate(
          { user_id: report.reported_user_id },
          { $inc: { warning_count: 1 } },
        );
      } else if (action === "suspend") {
        await User.findOneAndUpdate(
          { user_id: report.reported_user_id },
          { is_suspended: true },
        );
      } else if (action === "ban") {
        await User.findOneAndUpdate(
          { user_id: report.reported_user_id },
          { is_banned: true },
        );
      }
    }

    report.status = "resolved";
    report.action_taken = note
      ? `${RESOLVE_ACTION_LABELS[action]}: ${note}`
      : RESOLVE_ACTION_LABELS[action];
    report.reviewed_by = reviewed_by || null;
    report.resolved_at = new Date();
    await report.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { reporter_id, reported_listing_id, reported_user_id, reason } =
      req.body;
    if (!reporter_id || !reason)
      return res.status(400).json({ error: "missing_fields" });

    const report_id = await generateId(Report, "report_id", "report_id_");
    await new Report({
      report_id,
      reporter_id,
      reported_listing_id: reported_listing_id || null,
      reported_user_id: reported_user_id || null,
      reason,
      status: "pending",
    }).save();

    res.status(201).json({ report_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
