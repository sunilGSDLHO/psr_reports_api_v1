const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const telegramRoutes = require("./routes/telegram.routes");

const app = express();

app.use(cors());
app.use(express.json());

console.log(" app.js loaded");

// app.use((req, res, next) => {
//   console.log("", req.method, req.url);
//   next();
// });

app.post("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/telegram", telegramRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;