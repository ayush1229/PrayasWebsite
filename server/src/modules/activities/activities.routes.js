const express = require("express");
const activitiesController = require("./activities.controller");

const router = express.Router();

router.get("/", activitiesController.getActivities);

module.exports = router;
