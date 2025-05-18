"use strict";
const express = require("express");
const notificationController = require("../controllers/notification.controller");
const { asyncHandler } = require("../middleware/errorHandler");
const router = express.Router();

router.get("/", asyncHandler(notificationController.getNotification));
router.put("/:id", asyncHandler(notificationController.markAsRead));

module.exports = router;
