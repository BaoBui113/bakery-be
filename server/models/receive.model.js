"use strict";

const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var ReceiveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    order_ids: {
      type: Array,
      ref: "Order", // Array of ObjectId references to Order model
    },
  },
  {
    timestamps: true,
    collection: "Receives",
  }
);

//Export the model
module.exports = mongoose.model("Receive", ReceiveSchema);
