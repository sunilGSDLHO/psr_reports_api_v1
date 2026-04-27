const User = require("../models/user.model");
const { sendMessage } = require("../services/telegram.service");
const axios = require("axios");

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

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const TELEGRAM_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

exports.checkUserGroup = async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: "telegramId is required" });
    }

    const url = `${TELEGRAM_BASE}/getChatMember`;

    const response = await axios.get(url, {
      params: {
        chat_id: CHAT_ID,
        user_id: telegramId,
      },
    });

    if (response.data.ok) {
      const status = response.data.result.status;

      const isMember = ["member", "administrator", "creator"].includes(status);

      return res.json({
        success: true,
        isMember,
        status,
      });
    }

    return res.json({
      success: false,
      isMember: false,
    });

  } catch (error) {
    // Telegram returns 400 if user not in group
    if (error.response && error.response.status === 400) {
      return res.json({
        success: true,
        isMember: false,
        status: "not_member",
      });
    }

    console.error("checkUserGroup Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to check group",
    });
  }
};

exports.joinGroupLink = async (req, res) => {
  try {
    const url = `${TELEGRAM_BASE}/exportChatInviteLink`;

    const response = await axios.get(url, {
      params: {
        chat_id: CHAT_ID,
      },
    });

    if (response.data.ok) {
      return res.json({
        success: true,
        inviteLink: response.data.result,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate link",
    });

  } catch (error) {
    console.error("joinGroupLink Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get invite link",
    });
  }
};