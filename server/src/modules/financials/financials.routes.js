const express = require("express");
const financialsController = require("./financials.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

// Public
router.get("/", financialsController.getAll);
router.get("/:id", financialsController.getById);

// Admin only
router.post("/", verifyToken, adminOnly, financialsController.create);
router.put("/:id", verifyToken, adminOnly, financialsController.update);
router.delete("/:id", verifyToken, adminOnly, financialsController.remove);

module.exports = router;
