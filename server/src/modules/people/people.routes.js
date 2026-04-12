const express = require("express");
const peopleController = require("./people.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/", peopleController.getPeople);
router.get("/:id", peopleController.getPersonById);
router.post("/", verifyToken, adminOnly, peopleController.createPerson);
router.put("/:id", verifyToken, adminOnly, peopleController.updatePerson);
router.delete("/:id", verifyToken, adminOnly, peopleController.deletePerson);

module.exports = router;
