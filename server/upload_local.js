require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Parse the cloudinary URL
const cloudinaryUrl = process.env.CLOUDINARY_URL;
const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!match) throw new Error("Invalid CLOUDINARY_URL_NEW");
const [ , api_key, api_secret, cloud_name ] = match;

cloudinary.config({ cloud_name, api_key, api_secret });

const Activities = require("./src/modules/activities/activities.model.js");
const SiteConfig = require("./src/modules/global/siteConfig.model.js");

async function uploadLocalImages() {
  console.log("Connecting to New DB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const categories = [
    {
      dirPath: path.resolve(__dirname, "../old/assets/prayas"),
      activityName: "Prayas",
      year: 2024,
    },
    {
      dirPath: path.resolve(__dirname, "../old/assets/spardha"),
      activityName: "Spardha",
      year: 2024,
    },
    {
      dirPath: path.resolve(__dirname, "../old/assets/extra"),
      activityName: "Extra",
      year: 2024,
    },
    {
      dirPath: path.resolve(__dirname, "../images/gyanmanthan"),
      activityName: "GyanManthan",
      year: 2024,
    },
  ];

  for (const cat of categories) {
    if (!fs.existsSync(cat.dirPath)) {
      console.log(`Directory does not exist: ${cat.dirPath}, skipping...`);
      continue;
    }
    
    console.log(`Processing folder for ${cat.activityName}...`);
    const files = fs.readdirSync(cat.dirPath);
    let uploadedImages = [];
    
    for (const file of files) {
      if (file.match(/\.(png|jpg|jpeg)$/i)) {
        const filePath = path.join(cat.dirPath, file);
        console.log(`  Uploading ${file}...`);
        try {
          const result = await cloudinary.uploader.upload(filePath, { folder: "prayas_assets" });
          uploadedImages.push({
            imageUrl: result.secure_url,
            altText: file,
          });
          console.log(`  Uploaded ${file} -> ${result.secure_url}`);
        } catch (e) {
          console.error(`  Failed to upload ${file}:`, e.message);
        }
      }
    }

    if (uploadedImages.length > 0) {
      // Find or create activity
      const activity = await Activities.findOneAndUpdate(
        { activityName: cat.activityName, year: cat.year },
        { 
          $set: { images: uploadedImages, isActive: true }, 
          // tags: [], // can add tags if wanted 
        },
        { upsert: true, new: true }
      );
      console.log(`Saved ${uploadedImages.length} images for ${cat.activityName} to DB.`);
    }
  }

  // Upload Logo
  const logoPath = path.resolve(__dirname, "../old/assets/logo.png");
  if (fs.existsSync(logoPath)) {
    console.log("Uploading logo.png...");
    try {
      const result = await cloudinary.uploader.upload(logoPath, { folder: "prayas_assets" });
      const logoUrl = result.secure_url;
      console.log(`Uploaded logo -> ${logoUrl}`);
      
      // Update SiteConfig
      await SiteConfig.findOneAndUpdate(
        { type: "site_config" },
        { $set: { logoUrl } },
        { upsert: true, new: true }
      );
      console.log("Saved logoUrl to SiteConfig in DB.");
    } catch(e) {
       console.error("Failed to upload logo:", e.message);
    }
  }

  console.log("Done.");
  process.exit(0);
}

uploadLocalImages().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
