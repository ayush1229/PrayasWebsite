const Newsletter = require("./newsletter.model");

const getSubscribers = async () => {
  return await Newsletter.find({ isActive: true })
    .sort({ subscribedAt: -1 })
    .lean();
};

const subscribe = async (email) => {
  return await Newsletter.findOneAndUpdate(
    { email },
    { email, isActive: true, subscribedAt: new Date(), unsubscribedAt: undefined },
    { new: true, upsert: true, runValidators: true }
  ).lean();
};

const unsubscribe = async (email) => {
  return await Newsletter.findOneAndUpdate(
    { email },
    { isActive: false, unsubscribedAt: new Date() },
    { new: true }
  ).lean();
};

module.exports = { getSubscribers, subscribe, unsubscribe };
