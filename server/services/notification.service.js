const { BadRequestError } = require("../core/error.response");
const convertToObjectMongoose = require("../helper/convertToObject");
const notificationModel = require("../models/notification.model");

class NotificationService {
  static async sendNotification(notification) {
    const { title, content, from, to } = notification;
    const newNotification = await notificationModel.create({
      title,
      content,
      from: from,
      to: to,
    });
    return newNotification;
  }
  static async getNotifications(role, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const notifications = await notificationModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title content from createdAt read")
      .populate([
        {
          path: "to",
          match: { role },
          select: "name email role",
        },
        {
          path: "from",
          select: "name email role",
        },
      ]);

    // Lọc bỏ các notification không có `to` vì không match role

    // Optional: Đếm tổng số document match (cho client biết có bao nhiêu page)
    const total = await notificationModel.countDocuments();

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  static async markAsRead(notificationId) {
    const notification = await notificationModel.findOneAndUpdate(
      { _id: convertToObjectMongoose(notificationId) },
      { read: true },
      { new: true }
    );
    if (!notification) {
      throw new BadRequestError("Notification not found", 404);
    }
    return notification;
  }
}
module.exports = NotificationService;
