const Report = require("../models/Report");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Rating = require("../models/Rating");
const Cart = require("../models/Cart");
const Claim = require("../models/Claim");
const generateId = require("../utils/generateId");
const issueWarning = require("../utils/issueWarning");
const { suspendUser } = require("../utils/suspension");
const createNotification = require("../utils/createNotification");

function toFrontendShape(report, reporterName, subjectText) {
  return {
    reportId: report.report_id,
    reportType: report.reported_rating_id
      ? "Review Report"
      : report.reported_listing_id
        ? "Listing Report"
        : "User Report",
    reportedListingId: report.reported_listing_id || null,
    reportedRatingId: report.reported_rating_id || null,
    reporter: reporterName || "Unknown",
    status: report.status === "resolved" ? "Resolved" : "Pending Review",
    actionTaken: report.action_taken || null,
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
    listingMap[l.listings_id] = { name: l.product_name, seller_id: l.seller_id };
  });

  const ownerIds = [...new Set(listings.map((l) => l.seller_id).filter(Boolean))];
  const owners = await User.find({ user_id: { $in: ownerIds } });
  const ownerMap = {};
  owners.forEach((u) => {
    ownerMap[u.user_id] = `${u.first_name} ${u.last_name}`.trim();
  });

  const ratingIds = [
    ...new Set(reports.filter((r) => r.reported_rating_id).map((r) => r.reported_rating_id)),
  ];
  const ratings = await Rating.find({ rating_id: { $in: ratingIds } });
  const ratingMap = {};
  ratings.forEach((rt) => {
    ratingMap[rt.rating_id] = rt;
  });

  return reports.map((r) => {
    let subject;
    if (r.reported_rating_id) {
      const rating = ratingMap[r.reported_rating_id];
      const reviewerName = userMap[r.reported_user_id] || "Unknown User";
      subject = rating
        ? `Review by ${reviewerName}: "${rating.review || "(no comment)"}" (${rating.rating}★)`
        : `Review by ${reviewerName} (review no longer exists)`;
    } else if (r.reported_listing_id) {
      const listing = listingMap[r.reported_listing_id];
      const listingName = listing ? listing.name : "Unknown Listing";
      const ownerName =
        (listing && ownerMap[listing.seller_id]) || "Unknown Owner";
      subject = `Listing: ${listingName} — Owner: ${ownerName}`;
    } else {
      subject = `User: ${userMap[r.reported_user_id] || "Unknown User"}`;
    }
    return toFrontendShape(r, reporterMap[r.reporter_id], subject);
  });
}

const RESOLVE_ACTION_LABELS = {
  warning: "Warning issued",
  suspend: "User suspended",
  ban: "User banned",
  dismiss: "Dismissed",
};

const RESOLVE_ACTION_REPORTER_TEXT = {
  warning: "a warning was issued to the user you reported",
  suspend: "the user you reported was suspended",
  ban: "the user you reported was banned",
  dismiss: "your report was reviewed and dismissed",
};

exports.list = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await Report.find(filter).sort({ created_at: -1 });
    const result = await enrichReports(reports);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.mine = async (req, res) => {
  try {
    const { reporter_id } = req.query;
    if (!reporter_id)
      return res.status(400).json({ error: "missing_reporter_id" });
    const reports = await Report.find({ reporter_id }).sort({
      created_at: -1,
    });
    const result = await enrichReports(reports);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.resolve = async (req, res) => {
  try {
    const { action, note, reviewed_by } = req.body;
    if (!Object.keys(RESOLVE_ACTION_LABELS).includes(action)) {
      return res.status(400).json({ error: "invalid_action" });
    }

    const report = await Report.findOne({ report_id: req.params.id });
    if (!report) return res.status(404).json({ error: "not_found" });

    let autoSuspended = false;

    if (report.reported_user_id) {
      if (action === "warning") {
        const result = await issueWarning(
          report.reported_user_id,
          note,
          report.report_id,
        );
        autoSuspended = result ? result.autoSuspended : false;
      } else if (action === "suspend") {
        await suspendUser(report.reported_user_id);
      } else if (action === "ban") {
        await User.findOneAndUpdate(
          { user_id: report.reported_user_id },
          { is_banned: true },
        );
      }
    }

    let listingTakenDown = false;
    let cartsCleared = 0;
    let claimsCancelled = 0;

    if (report.reported_listing_id && action !== "dismiss") {
      const takenDownListing = await Listing.findOneAndUpdate(
        { listings_id: report.reported_listing_id, is_deleted: { $ne: true } },
        { status: "rejected" },
        { new: true },
      );

      if (takenDownListing) {
        listingTakenDown = true;

        const affectedCarts = await Cart.find({
          listing_id: report.reported_listing_id,
          does_exist: true,
        });
        if (affectedCarts.length) {
          await Cart.updateMany(
            { listing_id: report.reported_listing_id, does_exist: true },
            { does_exist: false },
          );
          cartsCleared = affectedCarts.length;
          const cartBuyerIds = [...new Set(affectedCarts.map((c) => c.buyer_id))];
          await Promise.all(
            cartBuyerIds.map((buyerId) =>
              createNotification(
                buyerId,
                "listing_removed_from_cart",
                `"${takenDownListing.product_name}" was removed from your cart after being taken down for a policy violation.`,
                report.reported_listing_id,
              ).catch(() => {}),
            ),
          );
        }

        // Mirrors claimsController.cancel's own rule: don't cancel a claim
        // the seller already confirmed their side of — that pickup may have
        // already happened, so it shouldn't be force-reverted here.
        const affectedClaims = await Claim.find({
          listing_id: report.reported_listing_id,
          status: "pending",
          seller_completed: { $ne: true },
        });
        if (affectedClaims.length) {
          await Claim.updateMany(
            {
              listing_id: report.reported_listing_id,
              status: "pending",
              seller_completed: { $ne: true },
            },
            { status: "cancelled" },
          );
          claimsCancelled = affectedClaims.length;
          const claimBuyerIds = [...new Set(affectedClaims.map((c) => c.buyer_id))];
          await Promise.all(
            claimBuyerIds.map((buyerId) =>
              createNotification(
                buyerId,
                "claim_cancelled",
                `Your claim on "${takenDownListing.product_name}" was cancelled because the listing was taken down for a policy violation.`,
                report.reported_listing_id,
              ).catch(() => {}),
            ),
          );
        }

        await createNotification(
          takenDownListing.seller_id,
          "listing_taken_down",
          `Your listing "${takenDownListing.product_name}" was taken down after a report against it was upheld.`,
          report.reported_listing_id,
        ).catch(() => {});
      }
    }

    report.status = "resolved";
    report.action_taken = note
      ? `${RESOLVE_ACTION_LABELS[action]}: ${note}`
      : RESOLVE_ACTION_LABELS[action];
    if (autoSuspended) {
      report.action_taken += " (auto-suspended: 3 warnings reached)";
    }
    report.reviewed_by = reviewed_by || null;
    report.resolved_at = new Date();
    await report.save();

    let subjectLabel = "your report";
    if (report.reported_listing_id) {
      const listing = await Listing.findOne({
        listings_id: report.reported_listing_id,
      });
      if (listing) subjectLabel = `your report on "${listing.product_name}"`;
    } else if (report.reported_user_id) {
      const reportedUser = await User.findOne({
        user_id: report.reported_user_id,
      });
      if (reportedUser)
        subjectLabel = `your report on ${reportedUser.first_name} ${reportedUser.last_name}`.trim();
    }
    await createNotification(
      report.reporter_id,
      "report_resolved",
      `An admin reviewed ${subjectLabel} — ${RESOLVE_ACTION_REPORTER_TEXT[action]}.`,
      report.report_id,
    ).catch(() => {});

    res.json({ success: true, autoSuspended, listingTakenDown, cartsCleared, claimsCancelled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { reporter_id, reported_listing_id, reported_user_id, reported_rating_id, reason } =
      req.body;
    if (!reporter_id || !reason)
      return res.status(400).json({ error: "missing_fields" });

    const report_id = await generateId(Report, "report_id", "report_id_");
    await new Report({
      report_id,
      reporter_id,
      reported_listing_id: reported_listing_id || null,
      reported_user_id: reported_user_id || null,
      reported_rating_id: reported_rating_id || null,
      reason,
      status: "pending",
    }).save();

    res.status(201).json({ report_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};
