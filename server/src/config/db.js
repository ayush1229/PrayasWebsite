require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || "mongodb://localhost:27017/prayas";

  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
