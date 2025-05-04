const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  static async getCart(req, res) {
    const cart = await CartService.getCart(req.user.id);
    return new SuccessResponse({
      message: "Get cart successfully",
      metadata: cart,
    }).send(res);
  }

  static async addToCart(req, res) {
    const cart = await CartService.addToCart(
      req.body.productId,
      req.body.quantity,
      req.user.id
    );
    return new SuccessResponse({
      message: "Add to cart successfully",
      metadata: cart,
    }).send(res);
  }

  static async updateCartItem(req, res) {
    const cart = await CartService.updateCartItem(
      req.user.id,
      req.body.productId,
      req.body.quantity
    );
    return new SuccessResponse({
      message: "Update cart item successfully",
      metadata: cart,
    }).send(res);
  }

  static async removeCartItem(req, res) {
    const cart = await CartService.removeCartItem(
      req.user.id,
      req.params.productId
    );
    return new SuccessResponse({
      message: "Remove cart item successfully",
      metadata: cart,
    }).send(res);
  }
}
module.exports = CartController;
