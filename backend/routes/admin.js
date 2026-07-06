const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/dashboard", adminController.getDashboard);
router.get("/admins", adminController.listAdmins);
router.post("/admins", adminController.promoteAdmin);
router.patch("/admins/:user_id/revoke", adminController.revokeAdmin);

module.exports = router;
