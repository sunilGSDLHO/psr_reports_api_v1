const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

console.log("Auth routes loaded");

router.post("/login", authController.login);
router.post("/register", authController.register); // NEW
router.post("/refresh", authController.refresh);

module.exports = router;