const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    empId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    telegramId: {
      type: String,
      default: null,
    },
    telegramGroupId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: "PSR",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);