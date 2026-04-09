const donationsService = require("./donations.service");

const getDonations = async (req, res) => {
  try {
    const donations = await donationsService.getDonations();
    return res.status(200).json(donations);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch donations", error: error.message });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await donationsService.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json(donation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch donation", error: error.message });
  }
};

const createDonation = async (req, res) => {
  try {
    const donation = await donationsService.createDonation(req.body);
    return res.status(201).json(donation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create donation", error: error.message });
  }
};

const updateDonation = async (req, res) => {
  try {
    const donation = await donationsService.updateDonation(
      req.params.id,
      req.body,
    );
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json(donation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update donation", error: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await donationsService.deleteDonation(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete donation", error: error.message });
  }
};

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
};
