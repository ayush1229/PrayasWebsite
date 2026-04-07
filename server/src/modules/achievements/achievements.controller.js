const achievementsService = require("./achievements.service");

const getAchievements = async (req, res) => {
  try {
    const data = await achievementsService.getAchievements();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAchievements,
};
