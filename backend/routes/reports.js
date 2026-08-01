const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, reportsController.list);
router.get("/mine", requireAuth, reportsController.mine);
router.patch("/:id/resolve", requireAdmin, reportsController.resolve);
router.post("/", requireAuth, reportsController.create);

module.exports = router;
