const express = require("express");
const router = express.Router();
const claimsController = require("../controllers/claimsController");

router.get("/", claimsController.list);
router.patch("/:id/buyer-complete", claimsController.buyerComplete);
router.patch("/:id/seller-complete", claimsController.sellerComplete);
router.delete("/:id", claimsController.cancel);

module.exports = router;
