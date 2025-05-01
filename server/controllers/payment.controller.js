const { SuccessResponse } = require("../core/success.response");
const PaymentService = require("../services/payment.service");

class PaymentController {
  static async processPayment(req, res) {
    return new SuccessResponse({
      message: "Payment processed successfully",
      metadata: await PaymentService.createPayment(req.body),
    }).send(res);
  }
}
module.exports = PaymentController;
