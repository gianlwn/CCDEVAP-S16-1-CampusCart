const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { requireAuth, requireAdmin, requireSelfOrAdmin } = require("../middleware/auth");

router.get("/", requireAdmin, usersController.list);
router.patch("/:user_id/status", requireAdmin, usersController.updateStatus);
router.patch("/:user_id/warn", requireAdmin, usersController.warn);
router.get("/:user_id", requireAuth, usersController.getOne);
router.put("/:user_id", requireSelfOrAdmin("user_id"), usersController.update);
router.delete("/:user_id", requireSelfOrAdmin("user_id"), usersController.remove);

module.exports = router;
