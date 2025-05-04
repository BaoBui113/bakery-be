"use strict";
const express = require("express");
const cartController = require("../controllers/cart.controller");
const { asyncHandler } = require("../middleware/errorHandler");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, asyncHandler(cartController.getCart));
router.post("/", authMiddleware, asyncHandler(cartController.addToCart));
router.put("/", authMiddleware, asyncHandler(cartController.updateCartItem));
router.delete(
  "/:productId",
  authMiddleware,
  asyncHandler(cartController.removeCartItem)
);
module.exports = router;
