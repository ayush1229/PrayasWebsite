const express = require("express");
const achievementsController = require("./achievements.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/", achievementsController.getAchievements);
router.get("/:slug", achievementsController.getAchievementBySlug);
router.post("/", verifyToken, adminOnly, achievementsController.createAchievement);
router.put("/:id", verifyToken, adminOnly, achievementsController.updateAchievement);
router.delete("/:id", verifyToken, adminOnly, achievementsController.deleteAchievement);

module.exports = router;
