const Media = require("./media.model");

const getAll = async ({ tag } = {}) => {
  const filter = { isActive: true };
  if (tag) filter.tag = tag;
  return Media.find(filter).sort({ tag: 1, order: 1, createdAt: -1 }).lean();
};

const getById = async (id) => {
  return Media.findById(id).lean();
};

const create = async (data) => {
  const doc = new Media(data);
  return doc.save();
};

const update = async (id, data) => {
  return Media.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    returnDocument: "after",
  });
};

const remove = async (id) => {
  return Media.findByIdAndDelete(id);
};

module.exports = { getAll, getById, create, update, remove };
