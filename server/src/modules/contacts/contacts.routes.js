const express = require("express");
const contactsController = require("./contacts.controller");

const router = express.Router();

router.get("/", contactsController.getContacts);
router.get("/:id", contactsController.getContactById);
router.post("/", contactsController.createContact);
router.put("/:id", contactsController.updateContact);
router.delete("/:id", contactsController.deleteContact);

module.exports = router;
