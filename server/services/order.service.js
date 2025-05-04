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

  static async confirmOrder(orderId) {
    const order = await orderModel.findById(orderId);
    if (!order) throw new BadRequestError("Order not found", 404);
    if (order.status !== "pending")
      throw new BadRequestError("Order already confirmed or cancelled", 400);

    order.status = "paid";
    await order.save();

    return order;
  }

  static async cancelOrder(orderId) {
    const order = await orderModel.findById(orderId);
    if (!order) throw new BadRequestError("Order not found", 404);
    if (order.status !== "pending")
      throw new BadRequestError("Order already confirmed or cancelled", 400);

    order.status = "cancelled";
    await order.save();

    return order;
  }

  static editQuantityOrder = async (orderId, quantity) => {
    const order = await orderModel.findById(orderId);
    if (!order) throw new BadRequestError("Order not found", 404);
    if (order.status !== "pending")
      throw new BadRequestError("Order already confirmed or cancelled", 400);
    order.quantity = quantity;
    await order.save();

    return order;
  };
}
module.exports = OrderService;
