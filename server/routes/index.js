"use strict";
const express = require("express");
// const { apiKey } = require("../auth/checkAuth");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/categories", require("./category"));
router.use("/products", require("./product"));
router.use("/payment", require("./payment"));
router.use("/cart", require("./cart"));
router.use("/orders", require("./order"));
router.use("/users", require("./user"));
router.use("/reports", require("./report"));
router.use("/", require("./upload"));
router.use("/notifications", require("./noti"));
module.exports = router;
