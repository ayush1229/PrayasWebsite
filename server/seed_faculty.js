require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("./src/modules/people/people.model");

const facultyData = [
  {
    "name": "Dr. Anoop Kumar",
    "department": "Mechanical Engineering",
    "organization": "NIT Hamirpur",
    "email": "anoop@nith.ac.in",
    "phones": ["+911972304726", "+919418009467"]
  },
  {
    "name": "Dr. Y. D. Sharma",
    "department": "Mathematics",
    "organization": "NIT Hamirpur",
    "email": "yds@nith.ac.in",
    "phones": ["+911972254126", "+919418153838"]
  },
  {
    "name": "Dr. Amit Kaul",
    "department": "Electrical Engineering",
    "organization": "NIT Hamirpur",
    "email": null,
    "phones": ["+919418132834"]
  }
];

const faculty = facultyData.map((f, i) => ({
  name: f.name,
  department: f.department,
  email: f.email,
  phone: f.phones && f.phones.length > 0 ? f.phones[0] : undefined,
  secondaryPhone: f.phones && f.phones.length > 1 ? f.phones[1] : undefined,
  roleType: "Faculty",
  isActive: true,
  displayOrder: i
}));

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const result = await Person.insertMany(faculty, { ordered: false });
  console.log(`Inserted ${result.length} faculty members.`);
  result.forEach(p => console.log(` ✔  ${p.name}  (${p._id})`));

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
