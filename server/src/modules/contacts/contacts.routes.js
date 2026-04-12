const express = require("express");
const contactsController = require("./contacts.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/", contactsController.getContacts);
router.get("/:id", contactsController.getContactById);
router.post("/", verifyToken, adminOnly, contactsController.createContact);
router.put("/:id", verifyToken, adminOnly, contactsController.updateContact);
router.delete("/:id", verifyToken, adminOnly, contactsController.deleteContact);

module.exports = router;
