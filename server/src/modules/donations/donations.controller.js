const donationsService = require("./donations.service");

const getDonations = (req, res) => {
  const data = donationsService.getDonations();
  res.status(200).json(data);
};

module.exports = {
  getDonations,
};
