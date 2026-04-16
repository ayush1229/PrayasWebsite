const financialsService = require("./financials.service");

const getAll = async (req, res) => {
  try {
    const { type } = req.query; // optional ?type=expenditures|donations
    const data = await financialsService.getAll({ type });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await financialsService.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Document not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await financialsService.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await financialsService.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Document not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const data = await financialsService.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Document not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
