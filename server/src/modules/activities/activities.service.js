const Activity = require("./activities.model");

const getActivities = async () => {
  return await Activity.find({ isActive: true }).sort({ year: -1 }).lean();
};

const getActivityById = async (id) => {
  return await Activity.findById(id).lean();
};

const createActivity = async (data) => {
  const activity = new Activity(data);
  return await activity.save();
};

const updateActivity = async (id, data) => {
  return await Activity.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

const deleteActivity = async (id) => {
  return await Activity.findByIdAndDelete(id).lean();
};

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
