"use strict";
const express = require("express");
const reportController = require("../controllers/report.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/", asyncHandler(reportController.getReport));

router.get("/:status", asyncHandler(reportController.getReportByStatus));

module.exports = router;
