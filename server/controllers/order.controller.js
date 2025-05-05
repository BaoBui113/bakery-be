const { SuccessResponse } = require("../core/success.response");
const OrderService = require("../services/order.service");

class OrderController {
  static async checkout(req, res) {
    return new SuccessResponse({
      message: "Order processed successfully",
      metadata: await OrderService.checkoutOrder(req.user.id),
    }).send(res);
  }

  static async getOrder(req, res) {
    return new SuccessResponse({
      message: "Get order successfully",
      metadata: await OrderService.getOrder(),
    }).send(res);
  }

  static async confirmOrder(req, res) {
    return new SuccessResponse({
      message: "Order confirmed successfully",
      metadata: await OrderService.confirmOrder(
        req.body.orderId,
        req.body.userId
      ),
    }).send(res);
  }

  static async cancelOrder(req, res) {
    return new SuccessResponse({
      message: "Order cancelled successfully",
      metadata: await OrderService.cancelOrder(
        req.body.orderId,
        req.body.userId
      ),
    }).send(res);
  }

  static async editQuantityOrder(req, res) {
    return new SuccessResponse({
      message: "Edit quantity order successfully",
      metadata: await OrderService.editQuantityOrder(
        req.body.orderId,
        req.body.userId,
        req.body.newQuantity
      ),
    }).send(res);
  }
}
module.exports = OrderController;
