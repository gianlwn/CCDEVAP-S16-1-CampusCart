const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, categoriesController.list);
router.post("/", requireAdmin, categoriesController.create);
router.put("/:category_id", requireAdmin, categoriesController.update);
router.delete("/:category_id", requireAdmin, categoriesController.remove);

module.exports = router;
