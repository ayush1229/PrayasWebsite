/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  migrate.js  –  Prayas Website: Old → New Cloudinary + MongoDB migration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  WHAT IT DOES
 *  ============
 *  1. Connects to OLD Mongo (MONGO_URI) and NEW Mongo (MONGO_URI_NEW).
 *  2. For every Cloudinary URL found in the old DB it:
 *       a. Downloads the image via the OLD Cloudinary account.
 *       b. Re-uploads it to the NEW Cloudinary account (preserving the
 *          original public_id so folder structure stays the same).
 *       c. Keeps a URL-map:  oldUrl → newUrl
 *  3. Copies every MongoDB document to the new DB, replacing any image URL
 *     with its new-Cloudinary counterpart.
 *
 *  Collections handled
 *  -------------------
 *  • people        profileImageUrl
 *  • activities    images[].imageUrl
 *  • achievements  images[]          (plain strings)
 *  • siteconfigs   logoUrl, donation.image, donation.upi.qrCodeUrl
 *
 *  HOW TO RUN
 *  ==========
 *      node migrate.js
 *
 *  Make sure your .env has:
 *      MONGO_URI            – old Atlas connection string
 *      MONGO_URI_NEW        – new Atlas connection string
 *      CLOUDINARY_URL       – old cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 *      CLOUDINARY_URL_NEW   – new cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Parse a CLOUDINARY_URL env var into { cloud_name, api_key, api_secret } */
function parseCloudinaryUrl(url) {
  // format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) throw new Error(`Invalid Cloudinary URL: ${url}`);
  const [, api_key, api_secret, cloud_name] = match;
  return { cloud_name, api_key, api_secret };
}

/** Build a separate Cloudinary SDK instance from credentials */
function makeCloudinary(credentials) {
  const instance = require("cloudinary").v2;
  // clone() isn't exposed, so we create separate configs via the upload API
  // Both calls use the same v2 singleton but we swap config each time.
  return credentials; // we'll reconfigure inline
}

/** Upload a remote URL to the NEW Cloudinary account.
 *  Returns the new secure_url.
 */
async function reuploadToNew(oldUrl, newCreds) {
  // Extract the public_id from the old URL so we preserve it
  // Old URL format:  https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<public_id>.<ext>
  let publicId = null;
  try {
    const urlObj = new URL(oldUrl);
    // pathname: /image/upload/v<version>/<public_id>.<ext>
    const parts = urlObj.pathname.split("/");
    // find "upload" segment index
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx !== -1) {
      // everything after upload (skip version segment that starts with "v")
      const rest = parts.slice(uploadIdx + 1);
      // remove version segment like "v1234567890"
      const withoutVersion = rest[0]?.match(/^v\d+$/) ? rest.slice(1) : rest;
      // join back and strip extension
      const joined = withoutVersion.join("/");
      publicId = joined.replace(/\.[^/.]+$/, ""); // remove extension
    }
  } catch (_) {
    // if URL parsing fails, let Cloudinary auto-assign a public_id
  }

  // Reconfigure the singleton for the NEW account
  cloudinary.config(newCreds);

  const uploadOptions = {
    resource_type: "auto",
    overwrite: false, // don't re-upload if already migrated
  };
  if (publicId) uploadOptions.public_id = publicId;

  const result = await cloudinary.uploader.upload(oldUrl, uploadOptions);
  return result.secure_url;
}

// ─── URL map cache ────────────────────────────────────────────────────────────

/** oldUrl → newUrl */
const urlCache = new Map();

async function migrateUrl(oldUrl, newCreds) {
  if (!oldUrl || typeof oldUrl !== "string") return oldUrl;
  if (!oldUrl.includes("res.cloudinary.com")) return oldUrl; // not a cloudinary URL
  if (urlCache.has(oldUrl)) return urlCache.get(oldUrl);

  try {
    const newUrl = await reuploadToNew(oldUrl, newCreds);
    urlCache.set(oldUrl, newUrl);
    console.log(`  ✔  ${publicIdFromUrl(oldUrl)}`);
    return newUrl;
  } catch (err) {
    console.error(`  ✘  Failed to migrate ${oldUrl}: ${err.message}`);
    return oldUrl; // keep old URL on failure so data is not lost
  }
}

function publicIdFromUrl(url) {
  try {
    return new URL(url).pathname.split("/").slice(-1)[0];
  } catch {
    return url;
  }
}

// ─── Collection migrators ─────────────────────────────────────────────────────

async function migratePeople(oldDb, newDb, newCreds) {
  console.log("\n📋  Migrating: people");
  const oldCol = oldDb.collection("people");
  const newCol = newDb.collection("people");
  await newCol.deleteMany({}); // start fresh

  const docs = await oldCol.find({}).toArray();
  console.log(`   Found ${docs.length} documents`);

  for (const doc of docs) {
    if (doc.profileImageUrl) {
      doc.profileImageUrl = await migrateUrl(doc.profileImageUrl, newCreds);
    }
    await newCol.insertOne(doc);
  }
  console.log(`   ✅  Done – ${docs.length} people migrated`);
}

async function migrateActivities(oldDb, newDb, newCreds) {
  console.log("\n📋  Migrating: activities");
  const oldCol = oldDb.collection("activities");
  const newCol = newDb.collection("activities");
  await newCol.deleteMany({});

  const docs = await oldCol.find({}).toArray();
  console.log(`   Found ${docs.length} documents`);

  for (const doc of docs) {
    if (Array.isArray(doc.images)) {
      for (const img of doc.images) {
        if (img && img.imageUrl) {
          img.imageUrl = await migrateUrl(img.imageUrl, newCreds);
        }
      }
    }
    await newCol.insertOne(doc);
  }
  console.log(`   ✅  Done – ${docs.length} activities migrated`);
}

async function migrateAchievements(oldDb, newDb, newCreds) {
  console.log("\n📋  Migrating: achievements");
  const oldCol = oldDb.collection("achievements");
  const newCol = newDb.collection("achievements");
  await newCol.deleteMany({});

  const docs = await oldCol.find({}).toArray();
  console.log(`   Found ${docs.length} documents`);

  for (const doc of docs) {
    if (Array.isArray(doc.images)) {
      doc.images = await Promise.all(
        doc.images.map((url) => migrateUrl(url, newCreds))
      );
    }
    await newCol.insertOne(doc);
  }
  console.log(`   ✅  Done – ${docs.length} achievements migrated`);
}

async function migrateSiteconfigs(oldDb, newDb, newCreds) {
  console.log("\n📋  Migrating: siteconfigs");
  const oldCol = oldDb.collection("siteconfigs");
  const newCol = newDb.collection("siteconfigs");
  await newCol.deleteMany({});

  const docs = await oldCol.find({}).toArray();
  console.log(`   Found ${docs.length} documents`);

  for (const doc of docs) {
    if (doc.logoUrl) doc.logoUrl = await migrateUrl(doc.logoUrl, newCreds);
    if (doc.donation) {
      if (doc.donation.image)
        doc.donation.image = await migrateUrl(doc.donation.image, newCreds);
      if (doc.donation.upi?.qrCodeUrl)
        doc.donation.upi.qrCodeUrl = await migrateUrl(
          doc.donation.upi.qrCodeUrl,
          newCreds
        );
    }
    await newCol.insertOne(doc);
  }
  console.log(`   ✅  Done – ${docs.length} siteconfigs migrated`);
}

/** Copy collections that have NO image URLs verbatim */
async function copyCollectionVerbatim(oldDb, newDb, collectionName) {
  console.log(`\n📋  Copying (verbatim): ${collectionName}`);
  const oldCol = oldDb.collection(collectionName);
  const newCol = newDb.collection(collectionName);
  await newCol.deleteMany({});

  const docs = await oldCol.find({}).toArray();
  if (docs.length > 0) await newCol.insertMany(docs);
  console.log(`   ✅  Done – ${docs.length} documents copied`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Prayas Website — MongoDB + Cloudinary Migration");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Validate env vars
  const requiredEnv = [
    "MONGO_URI",
    "MONGO_URI_NEW",
    "CLOUDINARY_URL",
    "CLOUDINARY_URL_NEW",
  ];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`❌  Missing env var: ${key}`);
      process.exit(1);
    }
  }

  const newCreds = parseCloudinaryUrl(process.env.CLOUDINARY_URL_NEW);
  console.log(`🌥   New Cloudinary cloud: ${newCreds.cloud_name}`);

  // Also configure old cloudinary for verification (not strictly needed for upload)
  const oldCreds = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  console.log(`🌥   Old Cloudinary cloud: ${oldCreds.cloud_name}`);

  // Connect to both MongoDB instances
  console.log("\n🔌  Connecting to OLD MongoDB …");
  const oldConn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();
  console.log("   Connected:", process.env.MONGO_URI.split("@")[1] ?? "old db");

  console.log("🔌  Connecting to NEW MongoDB …");
  const newConn = await mongoose
    .createConnection(process.env.MONGO_URI_NEW)
    .asPromise();
  console.log("   Connected:", process.env.MONGO_URI_NEW.split("@")[1] ?? "new db");

  const oldDb = oldConn.db;
  const newDb = newConn.db;

  // ── Collections with images ────────────────────────────────────────────────
  await migratePeople(oldDb, newDb, newCreds);
  await migrateActivities(oldDb, newDb, newCreds);
  await migrateAchievements(oldDb, newDb, newCreds);
  await migrateSiteconfigs(oldDb, newDb, newCreds);

  // ── Collections WITHOUT images (copy verbatim) ────────────────────────────
  await copyCollectionVerbatim(oldDb, newDb, "contacts");
  await copyCollectionVerbatim(oldDb, newDb, "donations");
  await copyCollectionVerbatim(oldDb, newDb, "newsletters");
  await copyCollectionVerbatim(oldDb, newDb, "pages");
  await copyCollectionVerbatim(oldDb, newDb, "users");

  console.log(
    "\n═══════════════════════════════════════════════════════════"
  );
  console.log(`  Migration complete!  ${urlCache.size} images re-uploaded.`);
  console.log(
    "═══════════════════════════════════════════════════════════\n"
  );

  await oldConn.close();
  await newConn.close();
}

main().catch((err) => {
  console.error("\n❌  Migration failed:", err);
  process.exit(1);
});
