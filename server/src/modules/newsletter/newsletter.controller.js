const newsletterService = require("./newsletter.service");

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await newsletterService.getSubscribers();
    res.status(200).json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const subscribe = async (req, res) => {
  try {
    const subscriber = await newsletterService.subscribe(req.body.email);
    res.status(201).json(subscriber);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const subscriber = await newsletterService.unsubscribe(req.body.email);
    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }
    res.status(200).json(subscriber);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSubscribers, subscribe, unsubscribe };
