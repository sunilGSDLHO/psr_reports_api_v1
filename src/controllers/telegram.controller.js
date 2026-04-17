const User = require("../models/user.model");
const { sendMessage } = require("../services/telegram.service");

exports.webhook = async (req, res) => {
  try {
    const body = req.body;

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Detect group or user
      const isGroup = body.message.chat.type.includes("group");

      if (isGroup) {
        console.log("Group ID:", chatId);
        return res.sendStatus(200);
      }

      // USER MESSAGE
      // Expected: /start EMP001
      if (text && text.startsWith("/start")) {
        const parts = text.split(" ");
        const empId = parts[1];

        if (!empId) {
          return res.send("Send /start EMPID");
        }

        const user = await User.findOne({ empId });

        if (!user) {
          return res.send("User not found in system");
        }

        // Link telegramId
        user.telegramId = chatId;
        await user.save();

        console.log(`Linked ${empId} with ${chatId}`);

        return res.send("Telegram linked successfully!");
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Check Telegram Status
exports.checkStatus = async (req, res) => {
  try {
    const { empId } = req.params;

    const user = await User.findOne({ empId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      empId: user.empId,
      telegramLinked: !!user.telegramId,
      telegramId: user.telegramId || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send to USER
exports.sendToUser = async (req, res) => {
  try {
    const { empId, message } = req.body;

    const user = await User.findOne({ empId });

    if (!user || !user.telegramId) {
      return res.status(404).json({ message: "User not linked to Telegram" });
    }

    await sendMessage(user.telegramId, message);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send to GROUP
exports.sendToGroup = async (req, res) => {
  try {
    const { groupId, message } = req.body;

    await sendMessage(groupId, message);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};