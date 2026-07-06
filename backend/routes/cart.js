const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.get("/", cartController.list);
router.post("/", cartController.add);
router.delete("/:cart_id", cartController.remove);
router.put("/:cart_id/quantity", cartController.updateQuantity);
router.post("/:cart_id/claim", cartController.claim);

module.exports = router;
