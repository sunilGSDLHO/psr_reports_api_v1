const { verifyAccessToken } = require("../services/token.service");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};