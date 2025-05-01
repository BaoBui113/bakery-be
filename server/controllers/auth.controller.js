const { SuccessResponse } = require("../core/success.response");
const AuthService = require("../services/auth.service");

class AuthController {
  static async register(req, res) {
    new SuccessResponse({
      message: "Register successfully",
      metadata: await AuthService.register(req.body),
    }).send(res);
  }
  static async login(req, res) {
    new SuccessResponse({
      message: "Login successfully",
      metadata: await AuthService.login(req.body),
    }).send(res);
  }
  static async loginAdmin(req, res) {
    new SuccessResponse({
      message: "Login admin successfully",
      metadata: await AuthService.loginAdmin(req.body),
    }).send(res);
  }
}
module.exports = AuthController;
