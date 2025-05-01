"use strict";

const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "Categories",
  }
);

//Export the model
module.exports = mongoose.model("Category", CategorySchema);
