const Person = require("./people.model");

const getPeople = async () => {
  return await Person.find({ isActive: true })
    .sort({ roleType: 1, displayOrder: 1 })
    .lean();
};

const getPersonById = async (id) => {
  return await Person.findById(id).lean();
};

const createPerson = async (data) => {
  const person = new Person(data);
  return await person.save();
};

const updatePerson = async (id, data) => {
  return await Person.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
};

const deletePerson = async (id) => {
  return await Person.findByIdAndDelete(id).lean();
};

module.exports = {
  getPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
};
