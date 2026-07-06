const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

router.get("/", reportsController.list);
router.patch("/:id/resolve", reportsController.resolve);
router.post("/", reportsController.create);

module.exports = router;
