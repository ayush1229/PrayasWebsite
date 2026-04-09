const achievementsService = require("./achievements.service");

const getAchievements = async (req, res) => {
  try {
    const achievements = await achievementsService.getAchievements();
    return res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAchievementBySlug = async (req, res) => {
  try {
    const achievement = await achievementsService.getAchievementBySlug(
      req.params.slug,
    );
    if (!achievement) {
      return res
        .status(404)
        .json({ success: false, message: "Achievement not found" });
    }
    return res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAchievement = async (req, res) => {
  try {
    const achievement = await achievementsService.createAchievement(req.body);
    return res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const achievement = await achievementsService.updateAchievement(
      req.params.id,
      req.body,
    );
    if (!achievement) {
      return res
        .status(404)
        .json({ success: false, message: "Achievement not found" });
    }
    return res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const achievement = await achievementsService.deleteAchievement(
      req.params.id,
    );
    if (!achievement) {
      return res
        .status(404)
        .json({ success: false, message: "Achievement not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Achievement deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAchievements,
  getAchievementBySlug,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
