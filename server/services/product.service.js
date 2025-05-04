const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const convertToObjectMongoose = require("../helper/convertToObject");
const productModel = require("../models/product.model");
const { checkCategory } = require("../models/repository/category");

const { redisClient } = require("../config/init.redis");
const { createOrder } = require("./order.service");
class ProductService {
  static async getAllProducts(query) {
    const {
      page = 1,
      category = "all",
      keyword,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const limit = 10;
    const skip = (page - 1) * limit;
    // Xây dựng bộ lọc động
    const filter = {};

    if (category && category !== "all") {
      filter.category_id = category;
    }

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" }; // 'i' để không phân biệt hoa thường
    }
    // Xây dựng điều kiện sắp xếp
    const sort = {};
    if (["name", "price", "stock", "createdAt"].includes(sortBy)) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }
    const [products, total] = await Promise.all([
      productModel
        .find(filter)
        .sort(sort)
        .populate("category_id")
        .skip(skip)
        .limit(limit)
        .lean(),
      productModel.countDocuments(filter),
    ]);

    return {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
    };
  }
  static async createProduct(body) {
    const { name, category_id, description, price, stock, image_url } = body;
    if (!name || !category_id || !description || !price || !stock) {
      throw new BadRequestError("Missing required fields", 400);
    }
    const existingCategory = await checkCategory(
      "_id",
      convertToObjectMongoose(category_id)
    );
    if (!existingCategory) {
      throw new BadRequestError("Category not found", 400);
    }
    const existingName = await productModel.findOne({ name }).lean();
    if (existingName) {
      throw new BadRequestError("Product name already exists", 400);
    }
    const newProduct = await productModel.create({
      name,
      category_id,
      description,
      price,
      stock,
      image_url,
    });
    return newProduct;
  }

  static async updateProduct(id, body) {
    const isExistingProduct = await productModel.findById(id);
    if (!isExistingProduct) {
      throw new BadRequestError("Product not found", 400);
    }

    if (body.name) {
      const existingProduct = await productModel.findOne({
        name: body.name,
        _id: { $ne: id },
      });
      if (existingProduct) {
        throw new BadRequestError("Product name already exists", 400);
      }
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        ...body,
      },
      { new: true }
    );
    return updatedProduct;
  }

  static async deleteProduct(id) {
    const isExistingProduct = await productModel.findById(id);
    if (!isExistingProduct) {
      throw new BadRequestError("Product not found", 400);
    }
    const deletedProduct = await productModel.findByIdAndDelete(id);
    return deletedProduct;
  }

  static async purchaseProduct(body, userId) {
    console.log("body", body);
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      throw new BadRequestError("Invalid product ID or quantity", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Sử dụng findOneAndUpdate để vừa kiểm tra stock vừa cập nhật
      const product = await productModel.findOneAndUpdate(
        {
          _id: convertToObjectMongoose(productId),
          stock: { $gte: quantity }, // chỉ update nếu đủ stock
        },
        {
          $inc: { stock: -quantity }, // trừ stock ngay
        },
        {
          new: true,
          session,
        }
      );

      if (!product) {
        throw new BadRequestError(
          "Product not found or insufficient stock",
          404
        );
      }
      const order = await createOrder(product._id, quantity, "pending", userId);

      await redisClient.set(
        `pending_payment:${order._id}`,
        JSON.stringify({
          orderId: order._id,
          quantity,
        }),
        {
          EX: 60 * 60, // 1 tiếng
        }
      );

      await session.commitTransaction();
      session.endSession();

      return product;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getProductById(id) {
    const product = await productModel.findById(id).lean();
    if (!product) {
      throw new BadRequestError("Product not found", 404);
    }
    return product;
  }

  static paymentSuccess(orderId) {
    return redisClient.del(`pending_payment:${orderId}`);
  }
}
module.exports = ProductService;
