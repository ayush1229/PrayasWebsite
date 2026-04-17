/**
 * One-time script to seed achievements.
 * Run from server directory: node src/scripts/seed-achievements.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Achievement = require("../modules/achievements/achievements.model");

const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

const achievements = [
  {
    title: "Selection at Himachal Pradesh University, Shimla",
    slug: "selection-hpu-shimla-2024",
    category: "Academic",
    year: 2024,
    description: "Sia secured admission to Himachal Pradesh University (HPU), Shimla, demonstrating strong academic performance.",
    images: [],
    priority: 2,
    isActive: true,
  },
  {
    title: "Placement at TVS Motor Company",
    slug: "placement-tvs-roshan-2025",
    category: "Recognition",
    year: 2025,
    description: "Roshan Bhagat secured employment at TVS Motor Company, marking a significant career milestone.",
    images: [],
    priority: 2,
    isActive: true,
  },
  {
    title: "Placement at Suzuki Motor",
    slug: "placement-suzuki-suraj-2025",
    category: "Recognition",
    year: 2025,
    description: "Suraj obtained a position at Suzuki Motor, reflecting industry readiness and skill development.",
    images: [],
    priority: 2,
    isActive: true,
  },
  {
    title: "Employment at Vardhman Group, Ludhiana",
    slug: "placement-vardhman-pooja-2025",
    category: "Recognition",
    year: 2025,
    description: "Pooja secured a role at Vardhman Group in Ludhiana, a leading textile manufacturing company.",
    images: [],
    priority: 2,
    isActive: true,
  },
  {
    title: "Selection in Jawahar Navodaya Vidyalaya (JNV)",
    slug: "selection-jnv-2026",
    category: "Academic",
    year: 2026,
    description: "Three students were selected for admission into Jawahar Navodaya Vidyalaya (JNV), highlighting academic excellence.",
    images: [],
    priority: 3,
    isActive: true,
  },
  {
    title: "Internship in Hospitality and Tourism",
    slug: "internship-hospitality-rakhi-2026",
    category: "Skills & Training",
    year: 2026,
    description: "Rakhi is undergoing internship training under the B.Voc program in Hospitality and Tourism, gaining practical industry exposure.",
    images: [],
    priority: 1,
    isActive: true,
  },
  {
    title: "Medical Assistance at AIIMS Bilaspur",
    slug: "medical-aid-aiims-kavya-2026",
    category: "Medical Aid",
    year: 2026,
    description: "Kavya received medical support and treatment assistance at AIIMS Bilaspur.",
    images: [],
    priority: 3,
    isActive: true,
  },
  {
    title: "Referral to IGMC Shimla for Advanced Care",
    slug: "medical-referral-igmc-anisha-2026",
    category: "Medical Aid",
    year: 2026,
    description: "Anisha was referred from Government Hospital Hamirpur to IGMC Shimla for advanced medical treatment.",
    images: [],
    priority: 2,
    isActive: true,
  },
  {
    title: "Financial Support for Eye Surgery",
    slug: "medical-support-eye-surgery-2026",
    category: "Medical Aid",
    year: 2026,
    description: "Financial assistance was provided through the Literacy initiative to support a student's parent undergoing eye surgery.",
    images: [],
    priority: 2,
    isActive: true,
  },
];

async function run() {
  if (!DB_URI) {
    console.error("No DB URI found. Set MONGO_URI / MONGODB_URI / DATABASE_URL in .env");
    process.exit(1);
  }

  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB");

  let inserted = 0;
  let skipped = 0;

  for (const a of achievements) {
    const existing = await Achievement.findOne({ slug: a.slug });
    if (existing) {
      console.log(`  [SKIP] "${a.title}" (slug already exists)`);
      skipped++;
      continue;
    }

    await Achievement.create(a);
    console.log(`  [OK]   ${a.year} — ${a.title}`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
