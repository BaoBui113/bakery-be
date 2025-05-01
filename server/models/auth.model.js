"use strict";

const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var AuthSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
    collection: "Auths",
  }
);

//Export the model
module.exports = mongoose.model("Auth", AuthSchema);
