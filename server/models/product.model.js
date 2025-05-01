"use strict";

const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "Products",
  }
);

//Export the model
module.exports = mongoose.model("Product", ProductSchema);
