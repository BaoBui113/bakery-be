const { BadRequestError } = require("../core/error.response");
const authModel = require("../models/auth.model");
const bcrypt = require("bcryptjs");
class UserService {
  static async getUser(query) {
    const { page = 1, limit = 10, field, value, type } = query;
    const skip = (page - 1) * limit;
    const filter = { role: "user", type: type };
    if (field && value) {
      filter[field] = { $regex: value, $options: "i" }; // search with case-insensitive
    }

    const [users, total] = await Promise.all([
      authModel.find(filter).select("-password").skip(skip).limit(limit).lean(),
      authModel.countDocuments(filter),
    ]);

    return {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
    };
  }

  static async handleUser(body) {
    const { userId, type } = body;
    if (!userId || !type) {
      throw new BadRequestError("Missing required fields");
    }
    const user = await authModel.findById(userId);
    if (!user) throw new BadRequestError("User not found");
    if (user.role === "admin") throw new BadRequestError("Cannot ban admin");
    user.type = type;
    await user.save();
    return user;
  }

  static async updateUser(body, userId) {
    if (!userId || !body) {
      throw new BadRequestError("Missing required fields");
    }
    const user = await authModel.findById(userId);
    if (!user) throw new BadRequestError("User not found");

    // Kiểm tra trùng email
    if (body.email) {
      const existingEmailUser = await authModel.findOne({
        email: body.email,
        _id: { $ne: userId }, // loại trừ chính user hiện tại
      });
      if (existingEmailUser) {
        throw new BadRequestError("Email is already in use");
      }
    }

    // Kiểm tra trùng số điện thoại
    if (body.phoneNumber) {
      const existingPhoneUser = await authModel.findOne({
        phoneNumber: body.phoneNumber,
        _id: { $ne: userId },
      });
      if (existingPhoneUser) {
        throw new BadRequestError("Phone number is already in use");
      }
    }

    if (body.password) {
      // Hash password trước khi lưu (ví dụ dùng bcrypt)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(body.password, salt);
      delete body.password; // Xóa password khỏi body để không gán lại bằng Object.assign
    }
    Object.assign(user, body);
    await user.save();
    return user;
  }
}
module.exports = UserService;
