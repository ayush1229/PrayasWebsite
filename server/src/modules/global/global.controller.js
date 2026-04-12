const globalService = require("./global.service");

const getGlobalData = async (req, res) => {
  try {
    const data = await globalService.getGlobalData();

    if (!data) {
      return res.status(404).json({ error: "Config not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateGlobalData = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const data = await globalService.updateGlobalData(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getGlobalData, updateGlobalData };
