const express = require("express");
const activitiesController = require("./activities.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/", activitiesController.getActivities);
router.get("/:id", activitiesController.getActivityById);
router.post("/", verifyToken, adminOnly, activitiesController.createActivity);
router.put("/:id", verifyToken, adminOnly, activitiesController.updateActivity);
router.delete("/:id", verifyToken, adminOnly, activitiesController.deleteActivity);

module.exports = router;
