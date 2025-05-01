const cron = require("node-cron");
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const { redisClient } = require("../config/init.redis");
const { deleteOrder } = require("../services/order.service");
const PAYMENT_TIMEOUT = 60 * 60 * 1000;

const startRestoreStockJob = () => {
  cron.schedule("*/10 * * * *", async () => {
    const keys = await redisClient.keys("pending_payment:*");

    for (const key of keys) {
      const orderId = key.replace("pending_payment:", "");

      // Fetch order status from database
      const order = await orderModel.findById(orderId);
      console.log(`Checking order status for orderId: ${orderId}`);

      if (!order || order.status === "paid") {
        continue; // đã thanh toán hoặc order không tồn tại => bỏ qua
      }

      if (order.status === "pending") {
        const now = Date.now();
        const orderCreatedTime = new Date(order.createdAt).getTime();

        // Nếu order pending quá lâu (ví dụ >60 phút)
        if (now - orderCreatedTime > PAYMENT_TIMEOUT) {
          await productModel.findByIdAndUpdate(order.productId, {
            $inc: { stock: order.quantity },
          });

          //   await orderModel.findByIdAndUpdate(orderId, { status: "cancelled" });
          deleteOrder(orderId);
          await redisClient.del(key);

          console.log(`Restored stock for expired order ${orderId}`);
        }
      }
    }
  });
};
module.exports = startRestoreStockJob;
