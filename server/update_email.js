require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("./src/modules/people/people.model");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");
  const res = await Person.updateOne(
    { name: "Dr. Amit Kaul", roleType: "Faculty" },
    { $set: { email: "amitkaul@nith.ac.in" } }
  );
  if (res.matchedCount > 0) {
    console.log(`Successfully updated email for Dr. Amit Kaul.`);
  } else {
    console.log(`Could not find Dr. Amit Kaul.`);
  }
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
