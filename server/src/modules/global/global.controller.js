const globalService = require("./global.service");

const getGlobalData = async (req, res) => {
  try {
    const data = await globalService.getGlobalData();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateGlobalData = async (req, res) => {
  try {
    const data = await globalService.updateGlobalData(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getGlobalData, updateGlobalData };
