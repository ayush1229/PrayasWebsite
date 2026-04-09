const ContactInquiry = require("./contacts.model");

const getContacts = async () => {
  return await ContactInquiry.find({ isArchived: false })
    .sort({ submittedAt: -1 })
    .lean();
};

const getContactById = async (id) => {
  return await ContactInquiry.findById(id).lean();
};

const createContact = async (data) => {
  const contact = new ContactInquiry(data);
  return await contact.save();
};

const updateContact = async (id, data) => {
  return await ContactInquiry.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
};

const deleteContact = async (id) => {
  return await ContactInquiry.findByIdAndDelete(id).lean();
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
