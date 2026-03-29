const globalService = require("./global.service");

const getGlobalData = (req, res) => {
  const data = globalService.getGlobalData();
  res.status(200).json(data);
};

module.exports = {
  getGlobalData,
};
