require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("./src/modules/people/people.model");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");
  
  // Set all students to year 4 by default
  const res1 = await Person.updateMany(
    { roleType: "Student" },
    { $set: { year: 4 } }
  );
  console.log(`Set ${res1.modifiedCount} students to year 4.`);

  // Update Nilu Kumari and Shubham Jaswal to year 5
  const res2 = await Person.updateMany(
    { name: { $in: ["Nilu Kumari", "Shubham Jaswal"] }, roleType: "Student" },
    { $set: { year: 5 } }
  );
  console.log(`Set ${res2.modifiedCount} students to year 5.`);

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
