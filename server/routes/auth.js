"use strict";
const express = require("express");
const authController = require("../controllers/auth.controller");
const { asyncHandler } = require("../middleware/errorHandler");
const authMiddleware = require("../middleware/authMiddleware");
const RegisterController = require("../controllers/register.controller");

const router = express.Router();
router.get("/", authMiddleware, asyncHandler(authController.getAuthUser));
router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/admin/login", asyncHandler(authController.loginAdmin));
router.post("/send-otp", asyncHandler(RegisterController.sendOtpEmail));
router.post("/verify-otp", asyncHandler(RegisterController.verifyOtpEmail));
router.post(
  "/check-email-exist",
  asyncHandler(RegisterController.checkEmailExist)
);
router.post(
  "/check-phone-number-exist",
  asyncHandler(RegisterController.checkPhoneNumberExist)
);
module.exports = router;
