const SiteConfig = require("./siteConfig.model");

const getGlobalData = async () => {
  const config = await SiteConfig.findOne({ type: "site_config" }).lean();

  if (!config) {
    return {
      type: "site_config",
      donation: {
        provider: "razorpay",
        publicKey: process.env.RAZORPAY_KEY_ID || null,
      },
    };
  }

  return {
    ...config,
    donation: {
      ...config.donation,
      publicKey: config.donation?.publicKey || process.env.RAZORPAY_KEY_ID || null,
    },
  };
};

const updateGlobalData = async (data) => {
  return await SiteConfig.findOneAndUpdate(
    { type: "site_config" },
    { $set: data },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();
};

module.exports = { getGlobalData, updateGlobalData };
