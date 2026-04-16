const express = require("express");
const mediaController = require("./media.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

// Public
router.get("/", mediaController.getAll);
router.get("/:id", mediaController.getById);

// Admin only
router.post("/", verifyToken, adminOnly, mediaController.create);
router.put("/:id", verifyToken, adminOnly, mediaController.update);
router.delete("/:id", verifyToken, adminOnly, mediaController.remove);

module.exports = router;
