const express = require("express");
const router = express.Router();
const listingsController = require("../controllers/listingsController");

router.get("/", listingsController.list);
router.get("/:id", listingsController.getOne);
router.post("/", listingsController.create);
router.put("/:id", listingsController.update);
router.patch("/:id/status", listingsController.updateStatus);
router.delete("/:id", listingsController.remove);

module.exports = router;
