const mongoose = require("mongoose");

function simpleSlugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const financialDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    type: {
      type: String,
      enum: ["expenditures", "donations"],
      required: true,
      index: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String, // for deletion from Cloudinary
    },

    year: {
      type: String, // e.g. "2024-25"
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

financialDocumentSchema.pre("save", function () {
  if (this.isModified("title") || this.isNew) {
    this.slug = simpleSlugify(this.title + "-" + this.year);
  }
});

financialDocumentSchema.index({ year: -1, createdAt: -1 });
financialDocumentSchema.index({ type: 1, year: -1 });

module.exports = mongoose.model("FinancialDocument", financialDocumentSchema);
