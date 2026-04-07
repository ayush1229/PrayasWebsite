const mongoose = require("mongoose");

const peopleSchema = new mongoose.Schema(
  {
    roleType: {
      type: String,
      enum: ["Faculty", "Student"],
      required: true
    },

    name: { type: String, required: true },

    email: String,
    phone: String,

    designation: String,

    bio: String,

    profileImageUrl: String,

    socialLinks: {
      linkedin: String,
      twitter: String
    },

    displayOrder: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

peopleSchema.index({ roleType: 1, displayOrder: 1 });

module.exports = mongoose.model("Person", peopleSchema);
