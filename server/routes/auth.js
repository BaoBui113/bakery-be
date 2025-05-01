"use strict";
const express = require("express");
const authController = require("../controllers/auth.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();
router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/admin/login", asyncHandler(authController.loginAdmin));
module.exports = router;
