const express = require("express");
const donationsController = require("./donations.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/config", donationsController.getDonationCheckoutConfig);
router.post("/create-order", donationsController.createDonationOrder);
router.post("/verify", donationsController.verifyDonationPayment);
router.post("/failure", donationsController.markDonationFailure);
router.get("/", donationsController.getDonations);
router.get("/:id", donationsController.getDonationById);
router.post("/", verifyToken, adminOnly, donationsController.createDonation);
router.put("/:id", verifyToken, adminOnly, donationsController.updateDonation);
router.delete("/:id", verifyToken, adminOnly, donationsController.deleteDonation);

module.exports = router;
