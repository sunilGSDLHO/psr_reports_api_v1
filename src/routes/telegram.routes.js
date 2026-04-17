const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegram.controller");

router.post("/webhook", telegramController.webhook);
router.post("/send-user", telegramController.sendToUser);
router.post("/send-group", telegramController.sendToGroup);

module.exports = router;