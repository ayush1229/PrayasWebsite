const { verifyTokenService } = require("./auth.service");
require("dotenv").config();

const adminOnly = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const user = verifyTokenService(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

module.exports = adminOnly;