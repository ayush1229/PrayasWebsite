const pagesService = require("./pages.service");

const getPages = async (req, res) => {
  try {
    const data = await pagesService.getPages();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPageBySlug = async (req, res) => {
  try {
    const data = await pagesService.getPageBySlug(req.params.slug);
    if (!data) return res.status(404).json({ error: "Page not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPage = async (req, res) => {
  try {
    const data = await pagesService.createPage(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePage = async (req, res) => {
  try {
    const data = await pagesService.updatePage(req.params.slug, req.body);
    if (!data) return res.status(404).json({ error: "Page not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePage = async (req, res) => {
  try {
    const data = await pagesService.deletePage(req.params.slug);
    if (!data) return res.status(404).json({ error: "Page not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPages, getPageBySlug, createPage, updatePage, deletePage };
