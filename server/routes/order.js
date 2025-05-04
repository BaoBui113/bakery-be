"use strict";
const express = require("express");
const orderController = require("../controllers/order.controller");
const { asyncHandler } = require("../middleware/errorHandler");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  "/checkout",
  authMiddleware,
  asyncHandler(orderController.checkout)
);

router.get("/", asyncHandler(orderController.getOrder));

module.exports = router;
