const { SuccessResponse } = require("../core/success.response");
const RegisterService = require("../services/register.service");

class RegisterController {
  static async sendOtpEmail(req, res) {
    return new SuccessResponse({
      message: "Send otp email successfully",
      metadata: await RegisterService.sendOtp(req.body.email),
    }).send(res);
  }

  static async verifyOtpEmail(req, res) {
    return new SuccessResponse({
      message: "Verify otp email successfully",
      metadata: await RegisterService.verifyOTP(req.body.email, req.body.otp),
    }).send(res);
  }

  static async checkEmailExist(req, res) {
    return new SuccessResponse({
      message: "Check email exist successfully",
      metadata: await RegisterService.checkEmailExist(req.body.email),
    }).send(res);
  }

  static async checkPhoneNumberExist(req, res) {
    return new SuccessResponse({
      message: "Check phone number exist successfully",
      metadata: await RegisterService.checkPhoneNumberExist(
        req.body.phoneNumber
      ),
    }).send(res);
  }
}
module.exports = RegisterController;
