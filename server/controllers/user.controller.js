const { SuccessResponse } = require("../core/success.response");
const UserService = require("../services/user.service");

class UserController {
  static async getUser(req, res) {
    return new SuccessResponse({
      message: "Get all users successfully",
      metadata: await UserService.getUser(req.query),
    }).send(res);
  }

  static async handleUser(req, res) {
    return new SuccessResponse({
      message: "Handle user successfully",
      metadata: await UserService.handleUser(req.body),
    }).send(res);
  }

  static async updateUser(req, res) {
    return new SuccessResponse({
      message: "Update user successfully",
      metadata: await UserService.updateUser(req.body, req.params.userId),
    }).send(res);
  }
}
module.exports = UserController;
