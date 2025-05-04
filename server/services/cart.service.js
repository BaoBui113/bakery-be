const { redisClient } = require("../config/init.redis");
const { BadRequestError } = require("../core/error.response");
const convertToObjectMongoose = require("../helper/convertToObject");
const productModel = require("../models/product.model");
const ProductService = require("./product.service");

class CartService {
  static CART_KEY = (userId) => `cart:${userId}`;

  static async getCart(userId) {
    const key = this.CART_KEY(userId);
    const cartRaw = await redisClient.get(key);
    const cart = cartRaw ? JSON.parse(cartRaw) : [];

    if (cart.length === 0) return [];

    // Lấy chi tiết các sản phẩm từ MongoDB
    const productIds = cart.map((item) =>
      convertToObjectMongoose(item.productId)
    );
    const products = await productModel.find({ _id: { $in: productIds } });

    // Ghép thông tin sản phẩm với giỏ hàng
    const detailedCart = cart.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
      };
    });

    return detailedCart;
  }

  static async addToCart(productId, quantity, userId) {
    if (quantity <= 0) throw new BadRequestError("Invalid quantity");
    const cart = await this.getCart(userId);
    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId,
        quantity,
      });
    }
    await redisClient.set(this.CART_KEY(userId), JSON.stringify(cart), {
      EX: 60 * 60, // 1 hours
    });
    return await this.getCart(userId);
  }
  static async updateCartItem(userId, productId, quantity) {
    if (quantity < 0) throw new BadRequestError("Invalid quantity");
    const cart = await this.getCart(userId);

    const item = cart.find((i) => i.productId === productId);
    if (!item) throw new BadRequestError("Item not in cart");

    if (quantity === 0) {
      return await this.removeCartItem(userId, productId);
    }

    item.quantity = quantity;
    await redisClient.set(this.CART_KEY(userId), JSON.stringify(cart), {
      EX: 60 * 60,
    });
    return cart;
  }

  static async removeCartItem(userId, productId) {
    const cart = await this.getCart(userId);
    const newCart = cart.filter((i) => i.productId !== productId);
    await redisClient.set(this.CART_KEY(userId), JSON.stringify(newCart), {
      EX: 60 * 60,
    });
    return newCart;
  }

  static async clearCart(userId) {
    await redisClient.del(this.CART_KEY(userId));
  }
}
module.exports = CartService;
