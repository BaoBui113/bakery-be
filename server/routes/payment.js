"use strict";
const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { asyncHandler } = require("../middleware/errorHandler");
const router = express.Router();

router.post("/", asyncHandler(paymentController.processPayment));

module.exports = router;
