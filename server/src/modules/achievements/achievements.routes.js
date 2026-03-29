const express = require("express");
const achievementsController = require("./achievements.controller");

const router = express.Router();

router.get("/", achievementsController.getAchievements);

module.exports = router;
