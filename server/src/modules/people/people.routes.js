const express = require("express");
const peopleController = require("./people.controller");

const router = express.Router();

router.get("/", peopleController.getPeople);
router.get("/:id", peopleController.getPersonById);
router.post("/", peopleController.createPerson);
router.put("/:id", peopleController.updatePerson);
router.delete("/:id", peopleController.deletePerson);

module.exports = router;
