const achievementsService = require("./achievements.service");

const getAchievements = (req, res) => {
  const data = achievementsService.getAchievements();
  res.status(200).json(data);
};

module.exports = {
  getAchievements,
};
