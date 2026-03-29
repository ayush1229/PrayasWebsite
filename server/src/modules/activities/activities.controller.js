const activitiesService = require("./activities.service");

const getActivities = (req, res) => {
  const data = activitiesService.getActivities();
  res.status(200).json(data);
};

module.exports = {
  getActivities,
};
