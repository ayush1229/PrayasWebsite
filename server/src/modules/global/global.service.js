const SiteConfig = require("./siteConfig.model");

const getGlobalData = async () => {
  return await SiteConfig.findOne({ type: "site_config" }).lean();
};

const updateGlobalData = async (data) => {
  return await SiteConfig.findOneAndUpdate(
    { type: "site_config" },
    { $set: data },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();
};

module.exports = { getGlobalData, updateGlobalData };
