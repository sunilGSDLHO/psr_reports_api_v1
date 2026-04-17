const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegram.controller");

const { authenticate } = require("../middleware/auth.middleware");

// Protected routes
router.get("/status/:empId", authenticate, telegramController.checkStatus);
router.post("/send-user", authenticate, telegramController.sendToUser);
router.post("/send-group", authenticate, telegramController.sendToGroup);

// Public (Telegram webhook)
router.post("/webhook", telegramController.webhook);

module.exports = router;