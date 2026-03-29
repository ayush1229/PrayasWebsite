const express = require("express");
const donationsController = require("./donations.controller");

const router = express.Router();

router.get("/", donationsController.getDonations);

module.exports = router;
