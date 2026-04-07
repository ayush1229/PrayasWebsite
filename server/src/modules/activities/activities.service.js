const Activity = require("./activities.model");

const getActivities = async () => {
  return await Activity.find().lean();
};

module.exports = {
  getActivities,
};
