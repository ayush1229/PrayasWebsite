const activitiesService = require("./activities.service");

const getActivities = async (req, res) => {
  try {
    const data = await activitiesService.getActivities();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getActivities,
};
