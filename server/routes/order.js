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
router.post("/confirm", asyncHandler(orderController.confirmOrder));
router.post("/cancel", asyncHandler(orderController.cancelOrder));
router.post("/edit-quantity", asyncHandler(orderController.editQuantityOrder));

module.exports = router;
