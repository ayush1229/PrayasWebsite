const express = require("express");
const achievementsRoutes = require("./modules/achievements/achievements.routes");
const activitiesRoutes = require("./modules/activities/activities.routes");
const donationsRoutes = require("./modules/donations/donations.routes");
const contactsRoutes = require("./modules/contacts/contacts.routes");
const globalRoutes = require("./modules/global/global.routes");
const newsletterRoutes = require("./modules/newsletter/newsletter.routes");
const pagesRoutes = require("./modules/pages/pages.routes");
const peopleRoutes = require("./modules/people/people.routes");
const authRoutes = require("./authentication/auth.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/api/achievements", achievementsRoutes);
router.use("/api/activities", activitiesRoutes);
router.use("/api/donations", donationsRoutes);
router.use("/api/contacts", contactsRoutes);
router.use("/api/global", globalRoutes);
router.use("/api/newsletter", newsletterRoutes);
router.use("/api/pages", pagesRoutes);
router.use("/api/people", peopleRoutes);

module.exports = router;
