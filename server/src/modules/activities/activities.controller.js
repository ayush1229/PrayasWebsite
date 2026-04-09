const activitiesService = require("./activities.service");

const getActivities = async (req, res) => {
  try {
    const activities = await activitiesService.getActivities();
    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch activities",
        error: error.message,
      });
  }
};

const getActivityById = async (req, res) => {
  try {
    const activity = await activitiesService.getActivityById(req.params.id);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    return res.status(200).json({ success: true, data: activity });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch activity",
        error: error.message,
      });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = await activitiesService.createActivity(req.body);
    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to create activity",
        error: error.message,
      });
  }
};

const updateActivity = async (req, res) => {
  try {
    const activity = await activitiesService.updateActivity(
      req.params.id,
      req.body,
    );
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    return res.status(200).json({ success: true, data: activity });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update activity",
        error: error.message,
      });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await activitiesService.deleteActivity(req.params.id);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete activity",
        error: error.message,
      });
  }
};

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
