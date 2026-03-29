const contactsService = require("./contacts.service");

const getContacts = (req, res) => {
  const data = contactsService.getContacts();
  res.status(200).json(data);
};

module.exports = {
  getContacts,
};
