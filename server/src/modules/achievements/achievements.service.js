const Achievement = require("./achievements.model");

const getAchievements = async () => {
  return await Achievement.find().lean();
};

module.exports = {
  getAchievements,
};
