const express = require("express");
const achievementsRoutes = require("./modules/achievements/achievements.routes");
const activitiesRoutes = require("./modules/activities/activities.routes");
const donationsRoutes = require("./modules/donations/donations.routes");
const contactsRoutes = require("./modules/contacts/contacts.routes");
const globalRoutes = require("./modules/global/global.routes");
const newsletterRoutes = require("./modules/newsletter/newsletter.routes");
const pagesRoutes = require("./modules/pages/pages.routes");
const peopleRoutes = require("./modules/people/people.routes");

const router = express.Router();

router.use("/achievements", achievementsRoutes);
router.use("/activities", activitiesRoutes);
router.use("/donations", donationsRoutes);
router.use("/contacts", contactsRoutes);
router.use("/global", globalRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/pages", pagesRoutes);
router.use("/people", peopleRoutes);

module.exports = router;
