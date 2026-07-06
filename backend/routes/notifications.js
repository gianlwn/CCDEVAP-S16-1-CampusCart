const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");

router.get("/", notificationsController.list);
router.patch("/read-all", notificationsController.readAll);
router.patch("/:id/read", notificationsController.markRead);

module.exports = router;
