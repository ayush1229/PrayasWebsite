const mongoose = require("mongoose");

const pagesSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true
    },

    title: {
      type: String,
      required: true
    },

    content: String,

    metaTitle: String,
    metaDescription: String,

    isPublished: {
      type: Boolean,
      default: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", pagesSchema);
