const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const CartService = require("./cart.service");
const convertToObjectMongoose = require("../helper/convertToObject");
const productModel = require("../models/product.model");
const authModel = require("../models/auth.model");
const NotificationService = require("./notification.service");

class OrderService {
  static async createOrder(productId, quantity, status, userId) {
    const order = await orderModel.create({
      productId,
      quantity,
      status,
      userId,
    });
    return order;
  }
  static async deleteOrder(orderId) {
    return await orderModel.findByIdAndUpdate(orderId, { status: "cancelled" });
  }

  static async checkoutOrder(userId) {
    const cart = await CartService.getCart(userId);
    if (!cart.length) throw new BadRequestError("Cart is empty");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await authModel.findById(userId);
      if (!user) throw new BadRequestError("User not found");
      const orders = [];
      const admin = await authModel.findOne({ role: "admin" });
      if (!admin) throw new BadRequestError("Admin not found");
      for (const { productId, quantity } of cart) {
        const product = await productModel.findOneAndUpdate(
          {
            _id: convertToObjectMongoose(productId),
            stock: { $gte: quantity },
          },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );

        if (!product) {
          throw new BadRequestError(
            `Insufficient stock for product ${productId}`
          );
        }
        const order = await orderModel.findOneAndUpdate(
          {
            userId,
            productId,
            status: "pending",
          },
          {
            $inc: { quantity },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          {
            new: true,
            upsert: true,
            session,
          }
        );
        orders.push(order);
      }

      await NotificationService.sendNotification({
        title: "Một đơn hàng mới đã được tạo",
        content: `Bạn có đơn hàng mới từ ${user.name}`,
        from: userId,
        to: admin._id,
      });

      await session.commitTransaction();
      session.endSession();

      await CartService.clearCart(userId);
      return orders;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  static async getOrder(query) {
    const { field, value, page = 1, limit = 10 } = query;
    // console.log("productName", productName);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const matchCondition =
      field && value
        ? {
            [field]: { $regex: value, $options: "i" },
          }
        : {};

    // Step 1: Count total items matching condition
    const totalCountAggregate = await orderModel.aggregate([
      {
        $lookup: {
          from: "Products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "Categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "Auths",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          quantity: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "product.name": 1,
          "user.email": 1,
          "user.phoneNumber": 1,
          "user.role": 1,
          "product._id": 1,
          "product.name": 1,
          "product.price": 1,
          "product.image_url": 1,
          "category.name": 1,
          "category._id": 1,
        },
      },
      { $match: matchCondition },
      { $count: "totalItems" },
    ]);

    const totalItems = totalCountAggregate[0]?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const orders = await orderModel.aggregate([
      // Join với bảng Product
      {
        $lookup: {
          from: "Products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Join với bảng Category thông qua category_id
      {
        $lookup: {
          from: "Categories",
          localField: "product.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      // Join với bảng Auth (user)
      {
        $lookup: {
          from: "Auths",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Loại bỏ password
      {
        $project: {
          quantity: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "product._id": 1,
          "product.name": 1,
          "product.price": 1,
          "product.image_url": 1,
          "category.name": 1,
          "category._id": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.phoneNumber": 1,
          "user.role": 1,
        },
      },

      ...(field && value
        ? [
            {
              $match: {
                [`${field}`]: { $regex: value, $options: "i" },
              },
            },
          ]
        : []),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    return {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      items: orders,
    };
  }

  static async confirmOrder(orderId, userId) {
    const order = await orderModel.findOne({
      _id: convertToObjectMongoose(orderId),
      userId,
    });
    if (!order) throw new BadRequestError("Order not found", 404);
    if (order.status === "cancelled" || order.status === "paid")
      throw new BadRequestError("Order already cancelled or paid", 400);
    order.status = "paid";
    await order.save();
    return order;
  }

  static async cancelOrder(orderId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderModel
        .findOne({
          _id: convertToObjectMongoose(orderId),
          userId,
        })
        .session(session);

      if (!order) throw new BadRequestError("Order not found", 404);
      if (order.status === "cancelled")
        throw new BadRequestError("Order already cancelled", 400);

      // Tìm sản phẩm liên quan đến đơn hàng
      const product = await productModel
        .findById(order.productId)
        .session(session);
      if (!product) throw new BadRequestError("Product not found", 404);

      // Tăng lại số lượng sản phẩm trong kho
      product.stock += order.quantity;
      await product.save({ session });

      // Cập nhật trạng thái đơn hàng
      order.status = "cancelled";
      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (err) {
      // Rollback transaction nếu có lỗi
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  static editQuantityOrder = async (orderId, userId, newQuantity) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await orderModel.findOne({
        _id: convertToObjectMongoose(orderId),
        userId,
      });
      if (!order) throw new BadRequestError("Order not found", 404);

      // Lấy sản phẩm liên quan đến đơn hàng
      const product = await productModel
        .findById(order.productId)
        .session(session);
      if (!product) throw new BadRequestError("Product not found", 404);

      // Tính toán sự thay đổi số lượng
      const quantityDifference = newQuantity - order.quantity;
      // Cập nhật số lượng sản phẩm trong kho
      product.stock -= quantityDifference;
      if (product.stock < 0) {
        throw new BadRequestError("Insufficient stock for product", 400);
      }
      await product.save({ session });

      // Cập nhật số lượng trong đơn hàng
      order.quantity = newQuantity;

      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();
      return order;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  };
}
module.exports = OrderService;
