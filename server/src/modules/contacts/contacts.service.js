const ContactInquiry = require("./contacts.model");

const getContacts = async () => {
  return await ContactInquiry.find().lean();
};

module.exports = {
  getContacts,
};
