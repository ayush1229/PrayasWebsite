const Donation = require("./donations.model");

const getDonations = async () => {
  return await Donation.find().lean();
};

module.exports = {
  getDonations,
};
