const express = require("express");
const donationsController = require("./donations.controller");

const router = express.Router();

router.get("/", donationsController.getDonations);
router.get("/:id", donationsController.getDonationById);
router.post("/", donationsController.createDonation);
router.put("/:id", donationsController.updateDonation);
router.delete("/:id", donationsController.deleteDonation);

module.exports = router;
