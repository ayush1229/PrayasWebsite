const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "site_config",
      unique: true
    },

    donation: {
      bankName: String,
      accountNumber: String,
      ifsc: String,
      branch: String,
      upiId: String
    },

    donationMessage: String,

    contactEmail: String,

    socialLinks: {
      instagram: String,
      linkedin: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
