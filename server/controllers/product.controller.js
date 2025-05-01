const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  static async getAllProducts(req, res) {
    return new SuccessResponse({
      message: "Get all products successfully",
      metadata: await ProductService.getAllProducts(req.query),
    }).send(res);
  }
  static async createProduct(req, res) {
    return new SuccessResponse({
      message: "Create product successfully",
      metadata: await ProductService.createProduct(req.body),
    }).send(res);
  }
  static async updateProduct(req, res) {
    return new SuccessResponse({
      message: "Update product successfully",
      metadata: await ProductService.updateProduct(req.params.id, req.body),
    }).send(res);
  }
  static async deleteProduct(req, res) {
    return new SuccessResponse({
      message: "Delete product successfully",
      metadata: await ProductService.deleteProduct(req.params.id),
    }).send(res);
  }
  static async purchaseProduct(req, res) {
    return new SuccessResponse({
      message: "Purchase product successfully",
      metadata: await ProductService.purchaseProduct(req.body),
    }).send(res);
  }
}
module.exports = ProductController;
