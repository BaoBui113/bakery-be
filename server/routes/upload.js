"use strict";
const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const { uploadController } = require("../controllers/upload.controller");

const router = express.Router();
router.post("/", upload.single("image"), uploadController);
module.exports = router;
