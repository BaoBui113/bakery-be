const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const { paymentModel } = require("../models/receive.model");
const { redisClient } = require("../config/init.redis");

const orderModel = require("../models/order.model");
class PaymentService {
  static async createPayment(body) {
    const { name, address, phone, order_ids } = body;
    if (!name || !address || !phone || !order_ids) {
      throw new BadRequestError("Missing required fields", 400);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const newPayment = await paymentModel.create(
        [
          {
            name,
            address,
            phone,
            order_ids,
          },
        ],
        { session }
      );
      await orderModel.updateMany(
        { _id: { $in: order_ids } },
        { status: "cancelled" },
        { session }
      );
      await Promise.all(
        order_ids.map((id) => redisClient.del(`pending_payment:${id}`))
      );
      await session.commitTransaction();
      session.endSession();
      return newPayment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
module.exports = PaymentService;
