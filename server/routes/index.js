"use strict";
const express = require("express");
// const { apiKey } = require("../auth/checkAuth");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/categories", require("./category"));
router.use("/products", require("./product"));
router.use("/payment", require("./payment"));
module.exports = router;
