require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("../modules/people/people.model");

const extras = [
  {
    "name": "Shubham Jaswal",
    "email": "jaswalshubham7683@gmail.com",
    "mobile": "+919805331020"
  },
  {
    "name": "Nilu Kumari",
    "email": "kumarinilu019@gmail.com",
    "mobile": "+918235256750"
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const lastStudent = await Person.findOne({ roleType: "Student" }).sort({ displayOrder: -1 });
  let nextOrder = lastStudent ? (lastStudent.displayOrder || 0) + 1 : 0;

  const docs = extras.map(e => ({
    name: e.name,
    email: e.email,
    phone: e.mobile,
    roleType: "Student",
    isActive: true,
    displayOrder: nextOrder++
  }));

  const result = await Person.insertMany(docs, { ordered: false });
  console.log(`Inserted ${result.length} extra students.`);
  result.forEach(p => console.log(` ✔  ${p.name}  [Order: ${p.displayOrder}]`));

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
