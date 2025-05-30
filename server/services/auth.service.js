const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require("../core/error.response");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model");
const { checkAuth } = require("../models/repository/auth");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
class AuthService {
  static async register(body) {
    const { email, password, name, phoneNumber } = body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !name || !phoneNumber) {
      throw new BadRequestError("Missing required fields", 400);
    }

    // Kiểm tra email đã tồn tại trong hệ thống
    const isCheckEmailExist = await checkAuth("email", email);
    if (isCheckEmailExist) throw new ConflictError("Email already exists", 409);

    // Kiểm tra số điện thoại đã tồn tại trong hệ thống
    const isCheckPhoneNumberExist = await checkAuth("phoneNumber", phoneNumber);

    if (isCheckPhoneNumberExist)
      throw new ConflictError("Phone number already exists", 409);

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10); // 10 là độ khó (salt rounds)

    // Tạo người dùng mới với mật khẩu đã mã hóa
    const newUser = await authModel.create({
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
      name,
      phoneNumber,
    });
    const payload = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_USER, {
      expiresIn: "1h",
    });
    return {
      accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    };
  }

  static async login(body) {
    const { email, password } = body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      throw new BadRequestError("Missing required fields", 400);
    }

    // Kiểm tra email đã tồn tại trong hệ thống
    const user = await authModel.findOne({ email, role: "user" });
    if (!user) throw new ConflictError("Email not found", 404);

    // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập vào
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new ConflictError("Invalid password", 401);
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_USER, {
      expiresIn: "1h",
    });

    return {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }

  static async loginAdmin(body) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestError("Missing required fields", 400);
    }

    const admin = await authModel.findOne({ email, role: "admin" });
    if (!admin) throw new ConflictError("Email not found", 404);

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new ConflictError("Invalid password", 401);

    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return accessToken;
  }

  static async getAuthUser(userId) {
    const user = await authModel
      .findById(userId)
      .select("-password") // không trả về mật khẩu
      .lean();
    if (!user) throw new NotFoundError("User not found", 404);
    return user;
  }
}
module.exports = AuthService;
