const express = require("express");
const router = express.Router();

const auth = require("./auth.controller");
const { verifyToken, superAdminOnly } = require("./auth.middleware");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.post("/create-admin", verifyToken, superAdminOnly, auth.createAdmin);
router.delete("/admin/:id", verifyToken, superAdminOnly, auth.deleteAdmin);

module.exports = router;