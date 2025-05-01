// lib/mongoose.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 50,
        readPreference: "primary",
      })
      .then(() => {
        console.log("MongoDB connected successfully!");
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
      });
    mongoose.set("debug", true);
    mongoose.set("debug", (collectionName, method, query, doc) => {
      console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
    });
    mongoose.set("debug", { color: true });
  }
  static getInstance() {
    if (!Database.instance) {
      // Check if an instance already exists
      Database.instance = new Database(); // Create a new instance if not
    }
    return Database.instance; // Return the existing instance
  }
}
const dbInstance = Database.getInstance(); // Get the singleton instance
module.exports = dbInstance; // Export the instance for use in other files
