const express = require("express");
const newsletterController = require("./newsletter.controller");

const router = express.Router();

router.get("/", newsletterController.getSubscribers);
router.post("/subscribe", newsletterController.subscribe);
router.post("/unsubscribe", newsletterController.unsubscribe);

module.exports = router;
