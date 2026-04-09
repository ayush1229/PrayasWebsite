const express = require("express");
const achievementsController = require("./achievements.controller");

const router = express.Router();

router.get("/", achievementsController.getAchievements);
router.get("/:slug", achievementsController.getAchievementBySlug);
router.post("/", achievementsController.createAchievement);
router.put("/:id", achievementsController.updateAchievement);
router.delete("/:id", achievementsController.deleteAchievement);

module.exports = router;
