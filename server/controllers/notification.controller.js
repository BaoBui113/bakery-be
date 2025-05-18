const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  static async getNotification(req, res) {
    return new SuccessResponse({
      message: "Get notification successfully",
      metadata: await NotificationService.getNotifications(
        req.query.role,
        req.query.page,
        req.query.limit
      ),
    }).send(res);
  }
  static async markAsRead(req, res) {
    return new SuccessResponse({
      message: "Mark notification as read successfully",
      metadata: await NotificationService.markAsRead(req.params.id),
    }).send(res);
  }
}
module.exports = NotificationController;
