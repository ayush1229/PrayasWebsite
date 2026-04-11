const Newsletter = require("./newsletter.model");

const getSubscribers = async () => {
  return await Newsletter.find({ isActive: true })
    .sort({ subscribedAt: -1 })
    .lean();
};

const subscribe = async (email) => {
  return await Newsletter.findOneAndUpdate(
    { email },
    {
      email,
      isActive: true,
      subscribedAt: new Date(),
      unsubscribedAt: undefined,
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();
};

const unsubscribe = async (email) => {
  return await Newsletter.findOneAndUpdate(
    { email },
    { isActive: false, unsubscribedAt: new Date() },
    { returnDocument: "after" },
  ).lean();
};

module.exports = { getSubscribers, subscribe, unsubscribe };
