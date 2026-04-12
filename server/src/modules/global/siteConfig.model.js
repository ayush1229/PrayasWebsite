const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "site_config",
      unique: true
    },

    donation: {
      provider: {
        type: String,
        enum: ["razorpay", "stripe", "paypal"]
      },
      paymentLink: String,
      publicKey: String,
      upi: {
        upiId: String,        // e.g. name@upi
        qrCodeUrl: String     // hosted image URL
      } 
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
