const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.sendMessage = async (chatId, text) => {
  return bot.sendMessage(chatId, text);
};

exports.getBot = () => bot;