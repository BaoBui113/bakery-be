const { SuccessResponse } = require("../core/success.response");
const CategoryService = require("../services/category.service");

class CategoryController {
  static async getCategories(req, res) {
    return new SuccessResponse({
      message: "Get categories successfully",
      metadata: await CategoryService.getAllCategories(),
    }).send(res);
  }
  static async createCategory(req, res) {
    return new SuccessResponse({
      message: "Create category successfully",
      metadata: await CategoryService.createCategory(req.body),
    }).send(res);
  }
  static async updateCategory(req, res) {
    return new SuccessResponse({
      message: "Update category successfully",
      metadata: await CategoryService.updateCategory(req.params.id, req.body),
    }).send(res);
  }
  static async deleteCategory(req, res) {
    return new SuccessResponse({
      message: "Delete category successfully",
      metadata: await CategoryService.deleteCategory(req.params.id),
    }).send(res);
  }
}

module.exports = CategoryController;
