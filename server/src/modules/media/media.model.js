const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Customisable tag used as section heading on the Media page
    tag: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional display order within a tag group
    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

mediaSchema.index({ tag: 1, order: 1 });

module.exports = mongoose.model("Media", mediaSchema);
