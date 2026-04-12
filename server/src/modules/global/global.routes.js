const express = require("express");
const globalController = require("./global.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/", globalController.getGlobalData);
router.put("/", verifyToken, adminOnly, globalController.updateGlobalData);

module.exports = router;
