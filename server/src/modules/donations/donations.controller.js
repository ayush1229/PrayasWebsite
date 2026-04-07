const donationsService = require("./donations.service");

const getDonations = async (req, res) => {
  try {
    const data = await donationsService.getDonations();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDonations,
};
