require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("./src/modules/people/people.model");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");
  const res = await Person.updateMany({ roleType: "Faculty" }, { $set: { organization: "NIT Hamirpur" } });
  console.log(`Updated ${res.modifiedCount} faculty records.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
