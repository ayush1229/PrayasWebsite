const Page = require("./pages.model");

const getPages = async () => {
  return await Page.find({ isPublished: true }).lean();
};

const getPageBySlug = async (slug) => {
  return await Page.findOne({ slug }).lean();
};

const createPage = async (data) => {
  const page = new Page(data);
  return await page.save();
};

const updatePage = async (slug, data) => {
  return await Page.findOneAndUpdate({ slug }, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

const deletePage = async (slug) => {
  return await Page.findOneAndDelete({ slug }).lean();
};

module.exports = {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
};
