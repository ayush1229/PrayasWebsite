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

const superAdminOnly = (req, res, next) => {
    if (req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Forbidden: Super Admin only" });
    }
    next();
};

module.exports = {
    verifyToken,
    adminOnly,
    superAdminOnly
};