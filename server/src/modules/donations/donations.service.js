const Donation = require("./donations.model");

const getDonations = async () => {
  return await Donation.find().sort({ date: -1 }).lean();
};

const getDonationById = async (id) => {
  return await Donation.findById(id).lean();
};

const createDonation = async (data) => {
  const donation = new Donation(data);
  return await donation.save();
};

const updateDonation = async (id, data) => {
  return await Donation.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

const deleteDonation = async (id) => {
  return await Donation.findByIdAndDelete(id).lean();
};

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
};
