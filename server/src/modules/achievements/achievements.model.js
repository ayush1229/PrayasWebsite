const mongoose = require("mongoose");

const achievementsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    category: {
      type: String,
      enum: ["Academic", "Medical Aid", "Recognition", "Skills & Training"],
      required: true,
    },

    year: {
      type: Number,
      required: true,
      index: true,
    },

    description: String,

    images: [String],

    priority: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Simple slug generator to avoid extra dependency
function simpleSlugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

achievementsSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = simpleSlugify(this.title);
  }
});

achievementsSchema.index({ category: 1 });

module.exports = mongoose.model("Achievement", achievementsSchema);
