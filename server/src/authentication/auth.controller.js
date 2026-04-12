const auth = require("./auth.service");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const result = await auth.loginService(email, password);

        res.cookie("token", result.token, {
            httpOnly: true,                                     // prevents JS access (XSS protection)
            secure: process.env.NODE_ENV === "production",    // true in production (HTTPS)
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
            maxAge: 24 * 60 * 60 * 1000                       // 1 day (matches your JWT expiry)
        });

        res.status(200).json({
            user: result.user
        });

    } catch (err) {
        res.status(401).json({
            error: err.message || "Authentication failed"
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({
            message: "Logout successful"
        });
    } catch (err) {
        res.status(500).json({
            error: err.message || "Logout failed"
        });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const newAdmin = await auth.createAdminService(email, password);

        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin
        });
    } catch (err) {
        res.status(400).json({
            error: err.message || "Admin creation failed"
        });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;

        if (!adminId) {
            return res.status(400).json({ error: "Admin ID is required" });
        }

        const result = await auth.deleteAdminService(adminId);

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: err.message || "Admin deletion failed"
        });
    }
};

module.exports = {
    login,
    logout,
    createAdmin,
    deleteAdmin
};