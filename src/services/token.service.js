const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};