const { BadRequestError } = require("../core/error.response");
const categoryModel = require("../models/category.model");
const { checkCategory } = require("../models/repository/category");

class CategoryService {
  static async getAllCategories() {
    const categories = await categoryModel.aggregate([
      { $match: { parent_id: null } }, // 1️⃣
      {
        $graphLookup: {
          from: "Categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent_id",
          as: "children",
        },
      },
    ]);
    return categories;
  }
  static async createCategory(body) {
    const { name, parent_id = null } = body;
    if (!name) throw new BadRequestError("Missing required fields", 400);
    const existingName = await categoryModel.findOne({
      name,
    });
    if (existingName)
      throw new BadRequestError("Category name already exists", 400);
    let parentCategory = null;
    if (parent_id) {
      parentCategory = await categoryModel.findById(parent_id);
      if (!parentCategory) {
        throw new BadRequestError("Parent category not found", 400);
      }
    }
    const newCategory = await categoryModel.create({
      name,
      parent_id: parentCategory ? parentCategory._id : null,
    });
    return newCategory;
  }

  static async updateCategory(id, body) {
    const { name, parent_id = null } = body;

    // Check for duplicate category name
    const existingCategory = await categoryModel.findOne({
      name,
      _id: { $ne: id },
    });
    if (existingCategory) {
      throw new BadRequestError("Category name already exists", 400);
    }

    // Prepare data for update
    const updateData = { name };

    // Validate parent_id if provided
    if ("parent_id" in body && parent_id) {
      const parentCategory = await categoryModel.findById(parent_id);
      if (!parentCategory) {
        throw new BadRequestError("Parent category not found", 400);
      }
      updateData.parent_id = parent_id;
    }

    // Update category and handle not found case
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedCategory) {
      throw new BadRequestError("Category not found", 404);
    }

    return updatedCategory;
  }

  static async deleteCategory(id) {
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      throw new BadRequestError("Category not found", 404);
    }
    return deletedCategory;
  }
}

module.exports = CategoryService;
