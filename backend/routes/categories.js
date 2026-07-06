const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

router.get("/", categoriesController.list);
router.post("/", categoriesController.create);
router.put("/:category_id", categoriesController.update);
router.delete("/:category_id", categoriesController.remove);

module.exports = router;
