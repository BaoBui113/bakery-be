"use strict";
const express = require("express");
const userController = require("../controllers/user.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/", asyncHandler(userController.getUser));
router.post("/", asyncHandler(userController.handleUser));
router.put("/:userId", asyncHandler(userController.updateUser));
module.exports = router;
