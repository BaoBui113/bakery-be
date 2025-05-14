"use strict";
const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadController,
  deleteImageController,
} = require("../controllers/upload.controller");

const router = express.Router();
router.post("/uploads", upload.single("image"), uploadController);
router.post("/delete-upload", deleteImageController);
module.exports = router;
