// scripts/seedUsers.js
const mongoose = require("mongoose");

const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // Add bcrypt for password hashing
const authModel = require("../models/auth.model");
dotenv.config();
const db = process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleNames = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Emily Davis",
  "William Brown",
  "Olivia Garcia",
  "James Wilson",
  "Sophia Martinez",
  "Benjamin Anderson",
];

const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const users = await Promise.all(
      sampleNames.map(async (name, i) => ({
        name,
        email: `test${Math.floor(Math.random() * 1000)}@example.com`,
        password: await bcrypt.hash("123456", salt), // Hash the password
        phoneNumber: `123456789${Math.floor(Math.random() * 10)}`,
        role: "user",
        gender: i % 2 === 0 ? "male" : "female",
      }))
    );

    await authModel.insertMany(users);
    console.log("Seed thành công!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
