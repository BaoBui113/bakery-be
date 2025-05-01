"use strict";

const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var OrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "Orders",
  }
);

//Export the model
module.exports = mongoose.model("Order", OrderSchema);
