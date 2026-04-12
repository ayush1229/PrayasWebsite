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

module.exports = {
    login
};