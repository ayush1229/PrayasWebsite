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

const getDonationByOrderId = async (orderId) => {
  return await Donation.findOne({ orderId }).lean();
};

const updateDonationByOrderId = async (orderId, data) => {
  return await Donation.findOneAndUpdate(
    { orderId },
    data,
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();
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
  getDonationByOrderId,
  updateDonationByOrderId,
  updateDonation,
  deleteDonation,
};
