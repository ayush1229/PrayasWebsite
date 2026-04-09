const contactsService = require("./contacts.service");

const getContacts = async (req, res) => {
  try {
    const contacts = await contactsService.getContacts();
    return res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await contactsService.getContactById(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createContact = async (req, res) => {
  try {
    const contact = await contactsService.createContact(req.body);
    return res.status(201).json({ success: true, data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const contact = await contactsService.updateContact(
      req.params.id,
      req.body,
    );
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await contactsService.deleteContact(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
