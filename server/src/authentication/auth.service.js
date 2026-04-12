const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./auth.model");
const dotenv = require("dotenv");
dotenv.config();

const generateTokenService = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

const loginService = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Invalid credentials");

  if (!user.isActive) throw new Error("User disabled");

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new Error("Invalid credentials");

  // Only admins allowed
  if (!["admin", "super_admin"].includes(user.role)) {
    throw new Error("Access denied");
  }

  const token = generateTokenService(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  };
};

const hashPasswordService = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPasswordService = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const verifyTokenService = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  generateTokenService,
  loginService,
  hashPasswordService,
  verifyPasswordService,
  verifyTokenService
};