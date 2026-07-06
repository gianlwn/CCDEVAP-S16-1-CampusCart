const express = require("express");
const router = express.Router();
const ratingsController = require("../controllers/ratingsController");

router.get("/seller/:user_id", ratingsController.listBySeller);
router.post("/", ratingsController.create);
router.put("/:id", ratingsController.update);
router.delete("/:id", ratingsController.remove);

module.exports = router;
