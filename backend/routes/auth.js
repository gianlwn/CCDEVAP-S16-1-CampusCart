const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/send-code", authController.sendCode);
router.post("/verify-code", authController.verifyCode);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/send-recovery", authController.sendRecovery);
router.post("/verify-recovery", authController.verifyRecovery);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
