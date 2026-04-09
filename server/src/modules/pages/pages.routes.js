const express = require("express");
const pagesController = require("./pages.controller");

const router = express.Router();

router.get("/", pagesController.getPages);
router.get("/:slug", pagesController.getPageBySlug);
router.post("/", pagesController.createPage);
router.put("/:slug", pagesController.updatePage);
router.delete("/:slug", pagesController.deletePage);

module.exports = router;
