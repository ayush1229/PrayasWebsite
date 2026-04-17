/**
 * One-time script to seed student contacts into the People collection.
 * Run from server directory: node src/scripts/seed-students.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("../modules/people/people.model");

const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

// Students with rollNo → year 4, without → year 3
const students = [
  { name: "Suraj Kumar",         email: "surajkumar93039@gmail.com",  phone: "+919199603343", year: 4 },
  { name: "Jagat Singh",         email: "jagats845@gmail.com",         phone: "+917976861519", year: 3 },
  { name: "Harsh Nagar",         email: "harshnagaryou@gmail.com",     phone: "+918005697043", year: 3 },
  { name: "Rakesh Kumar",        email: "22bee090@nith.ac.in",          phone: "+917781057081", year: 4 },
  { name: "Nikita Saini",        email: "saininikita1000@gmail.com",   phone: "+917296975479", year: 3 },
  { name: "Sudhanshu",           email: "sudhanshunith27@gmail.com",   phone: "+917488080633", year: 3 },
  { name: "Jay Pratap",          email: "jaypratap2560@gmail.com",     phone: "+918218113893", year: 3 },
  { name: "Tuhina Pegu",         email: "tuhinapegu73@gmail.com",      phone: "+917086131590", year: 3 },
  { name: "Kishan Kumar",        email: "kishankumar12345a@gmail.com", phone: "+917782996755", year: 3 },
  { name: "Esha Khanoria",       email: "eshakhanoria@gmail.com",      phone: "+918708656894", year: 3 },
  { name: "Anmol",               email: "dhimananmol19173@gmail.com",  phone: "+918278838468", year: 3 },
  { name: "Aadesh Kumar",        email: "aadeshsawant77@gmail.com",    phone: "+917742813591", year: 4 },
  { name: "Akhilesh Kumar Verma",email: "akhilesh7april3@gmail.com",   phone: "+917458097065", year: 4 },
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

  for (const s of students) {
    // Skip if already exists (match by email)
    const existing = await Person.findOne({ email: s.email, roleType: "Student" });
    if (existing) {
      console.log(`  [SKIP] ${s.name} (${s.email}) already exists`);
      skipped++;
      continue;
    }

    await Person.create({
      roleType: "Student",
      name:     s.name,
      email:    s.email,
      phone:    s.phone,
      year:     s.year,
      isActive: true,
    });

    console.log(`  [OK]   ${s.name} — year ${s.year}`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (already exist): ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
