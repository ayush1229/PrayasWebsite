const mongoose = require("mongoose");

const financialDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["expenditures", "donations"],
      required: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
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

financialDocumentSchema.index({ year: -1, createdAt: -1 });

module.exports = mongoose.model("FinancialDocument", financialDocumentSchema);
