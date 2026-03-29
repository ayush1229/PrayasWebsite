const express = require("express");
const globalController = require("./global.controller");

const router = express.Router();

router.get("/", globalController.getGlobalData);

module.exports = router;
