const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../services/token.service");

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    const { login, password } = req.body;

    const user = await User.findOne({
      $or: [{ empId: login }, { username: login }],
    });

    console.log("DB user:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      empId: user.empId,
      username: user.username,
    };

    console.log("Login success");

    const accessToken = jwt.sign(
      {
        id: user._id,
        empId: user.empId,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      accessToken,
      refreshToken,
      user
    });
    
    // res.json({
    //   accessToken: generateAccessToken(payload),
    //   refreshToken: generateRefreshToken(payload),
    //   user,
    // });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// REGISTER (for testing)
exports.register = async (req, res) => {
  try {
    const { empId, username, password } = req.body;

    const existingUser = await User.findOne({ empId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      empId,
      username,
      password: hashedPassword,
    });

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REFRESH
exports.refresh = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const user = verifyRefreshToken(token);

    const newAccessToken = generateAccessToken({
      id: user.id,
      empId: user.empId,
      role: user.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};