const FinancialDocument = require("./financials.model");

const getAll = async ({ type } = {}) => {
  const filter = { isActive: true };
  if (type) filter.type = type;
  return FinancialDocument.find(filter).sort({ year: -1, createdAt: -1 }).lean();
};

const getById = async (id) => {
  return FinancialDocument.findById(id).lean();
};

const create = async (data) => {
  const doc = new FinancialDocument(data);
  return doc.save();
};

const update = async (id, data) => {
  return FinancialDocument.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    returnDocument: "after",
  });
};

const remove = async (id) => {
  return FinancialDocument.findByIdAndDelete(id);
};

module.exports = { getAll, getById, create, update, remove };
