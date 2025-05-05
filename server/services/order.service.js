const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const CartService = require("./cart.service");
const convertToObjectMongoose = require("../helper/convertToObject");
const productModel = require("../models/product.model");

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
      const orders = [];

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

  static async getOrder() {
    const orders = await orderModel
      .find({})
      .populate({
        path: "productId",
        populate: {
          path: "category_id",
        },
      })
      .populate({
        path: "userId",
        select: "-password", // loại bỏ field password
      })
      .lean();

    if (!orders) throw new BadRequestError("Order not found", 404);
    return orders;
  }

  static async confirmOrder(orderId, userId) {
    const order = await orderModel.findOne({
      _id: convertToObjectMongoose(orderId),
      userId,
    });
    if (!order) throw new BadRequestError("Order not found", 404);
    if (order.status === "pending")
      throw new BadRequestError("Order already cancelled", 400);
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
