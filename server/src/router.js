const express = require("express");
const achievementsRoutes = require("./modules/achievements/achievements.routes");
const activitiesRoutes = require("./modules/activities/activities.routes");
const donationsRoutes = require("./modules/donations/donations.routes");
const contactsRoutes = require("./modules/contacts/contacts.routes");
const globalRoutes = require("./modules/global/global.routes");

const router = express.Router();

router.use("/achievements", achievementsRoutes);
router.use("/activities", activitiesRoutes);
router.use("/donations", donationsRoutes);
router.use("/contacts", contactsRoutes);
router.use("/global", globalRoutes);

module.exports = router;
