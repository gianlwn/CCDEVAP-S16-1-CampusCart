const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const generateId = require("../utils/generateId");

// POST /api/reports
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
