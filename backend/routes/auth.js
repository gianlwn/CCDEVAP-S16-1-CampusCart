const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/send-code", authController.sendCode);
router.post("/verify-code", authController.verifyCode);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/send-recovery", authController.sendRecovery);
router.post("/verify-recovery", authController.verifyRecovery);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
