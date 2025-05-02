"use strict";
const express = require("express");
const productController = require("../controllers/product.controller");
const { asyncHandler } = require("../middleware/errorHandler");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", asyncHandler(productController.getAllProducts));
router.post("/", asyncHandler(productController.createProduct));
router.put("/:id", asyncHandler(productController.updateProduct));
router.post(
  "/purchase",
  authMiddleware,
  asyncHandler(productController.purchaseProduct)
);
router.delete("/:id", asyncHandler(productController.deleteProduct));
module.exports = router;
