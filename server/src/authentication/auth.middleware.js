const { verifyTokenService } = require("./auth.service");
require("dotenv").config();

const verifyToken = (req, res, next) => {
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

const adminOnly = (req, res, next) => {
    if (!["admin", "super_admin"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
};

module.exports = {
    verifyToken,
    adminOnly
};