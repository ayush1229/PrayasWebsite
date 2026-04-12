const express = require("express");
const pagesController = require("./pages.controller");
const { verifyToken, adminOnly } = require("../../authentication/auth.middleware");

const router = express.Router();

router.get("/", pagesController.getPages);
router.get("/:slug", pagesController.getPageBySlug);
router.post("/", verifyToken, adminOnly, pagesController.createPage);
router.put("/:slug", verifyToken, adminOnly, pagesController.updatePage);
router.delete("/:slug", verifyToken, adminOnly, pagesController.deletePage);

module.exports = router;
