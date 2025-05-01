const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");

class OrderService {
  static async createOrder(productId, quantity, status) {
    const order = await orderModel.create({
      productId,
      quantity,
      status,
    });
    return order;
  }
  static async deleteOrder(orderId) {
    return await orderModel.findByIdAndUpdate(orderId, { status: "cancelled" });
  }
}
module.exports = OrderService;
