const contactsService = require("./contacts.service");

const getContacts = async (req, res) => {
  try {
    const data = await contactsService.getContacts();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getContacts,
};
