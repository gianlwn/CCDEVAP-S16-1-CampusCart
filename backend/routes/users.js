const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/", usersController.list);
router.patch("/:user_id/status", usersController.updateStatus);
router.patch("/:user_id/warn", usersController.warn);
router.get("/:user_id", usersController.getOne);
router.put("/:user_id", usersController.update);
router.delete("/:user_id", usersController.remove);

module.exports = router;
