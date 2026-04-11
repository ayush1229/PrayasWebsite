const Achievement = require("./achievements.model");

const getAchievements = async () => {
  return await Achievement.find({ isActive: true })
    .sort({ priority: -1, year: -1 })
    .lean();
};

const getAchievementBySlug = async (slug) => {
  return await Achievement.findOne({ slug }).lean();
};

const createAchievement = async (data) => {
  const achievement = new Achievement(data);
  return await achievement.save();
};

const updateAchievement = async (id, data) => {
  return await Achievement.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

const deleteAchievement = async (id) => {
  return await Achievement.findByIdAndDelete(id).lean();
};

module.exports = {
  getAchievements,
  getAchievementBySlug,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
