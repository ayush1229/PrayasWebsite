const peopleService = require("./people.service");

const getPeople = async (req, res) => {
  try {
    const data = await peopleService.getPeople();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPersonById = async (req, res) => {
  try {
    const person = await peopleService.getPersonById(req.params.id);
    if (!person) return res.status(404).json({ error: "Person not found" });
    res.status(200).json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPerson = async (req, res) => {
  try {
    const person = await peopleService.createPerson(req.body);
    res.status(201).json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePerson = async (req, res) => {
  try {
    const person = await peopleService.updatePerson(req.params.id, req.body);
    if (!person) return res.status(404).json({ error: "Person not found" });
    res.status(200).json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePerson = async (req, res) => {
  try {
    const person = await peopleService.deletePerson(req.params.id);
    if (!person) return res.status(404).json({ error: "Person not found" });
    res.status(200).json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPeople, getPersonById, createPerson, updatePerson, deletePerson };
