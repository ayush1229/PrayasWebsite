/**
 * Seed financial documents using local static file URLs (no Cloudinary).
 * PDFs are served by the Express static middleware at /files/financials/...
 * Run: node src/scripts/seed-financials-local.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const FinancialDocument = require("../modules/financials/financials.model");

const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

// Store RELATIVE paths — frontend will prepend the backend origin.
// This works on both localhost and any deployed server.
const BASE_PATH = "/files/financials";

const expenditures = [
  { file: "Expenditure2014.pdf",      year: "2013-14" },
  { file: "Expenditure2015.pdf",      year: "2014-15" },
  { file: "expenditure2016.pdf",      year: "2015-16" },
  { file: "expenditure 2017-18.pdf",  year: "2017-18" },
  { file: "expenditure2018-19.pdf",   year: "2018-19" },
  { file: "2024 Expenditure.pdf",     year: "2023-24" },
  { file: "expenditure2024-25.pdf",   year: "2024-25" },
];

const donations = [
  { file: "2012-13.pdf",          year: "2012-13" },
  { file: "Donations2015.pdf",    year: "2014-15" },
  { file: "Donations2016.pdf",    year: "2016-17" },
  { file: "Donations2017-18.pdf", year: "2017-18" },
  { file: "donations2018-19.pdf", year: "2018-19" },
  { file: "donations2024-25.pdf", year: "2024-25" },
];

function makeSlug(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function upsertDocs(entries, type, subfolder) {
  for (const entry of entries) {
    const encodedFile = encodeURIComponent(entry.file);
    const pdfUrl = `${BASE_PATH}/${subfolder}/${encodedFile}`;
    const title = `${type === "expenditures" ? "Expenditure" : "Donation"} Report ${entry.year}`;
    const slug = makeSlug(`${title}-${entry.year}`);

    await FinancialDocument.updateOne(
      { year: entry.year, type },
      {
        $set: {
          title,
          slug,
          pdfUrl,
          publicId: null,
          isActive: true,
        },
        $setOnInsert: { type, year: entry.year },
      },
      { upsert: true }
    );
    console.log(`  [OK] ${type} ${entry.year} → ${pdfUrl}`);
  }
}

async function run() {
  if (!DB_URI) { console.error("No DB URI."); process.exit(1); }

  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB\n");

  console.log("── Expenditures ──");
  await upsertDocs(expenditures, "expenditures", "expenditure");

  console.log("\n── Donations ──");
  await upsertDocs(donations, "donations", "donations");

  console.log(`\nDone. Total: ${expenditures.length + donations.length} records upserted.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
