const { redisClient } = require("../config/init.redis");
const nodemailer = require("nodemailer");
const { BadRequestError, ConflictError } = require("../core/error.response");
const { checkAuth } = require("../models/repository/auth");
const OTP_TTL = 600;
const password = "azwj qevb yhyj iiey";
const email_send = "buitragiabao2015@gmail.com";
class RegisterService {
  static async checkEmailExist(email) {
    if (!email) {
      throw new BadRequestError("Email is required");
    }
    const isCheckEmailExist = await checkAuth("email", email);
    if (isCheckEmailExist) throw new ConflictError("Email already exists", 409);
    return true;
  }

  static async checkPhoneNumberExist(phoneNumber) {
    if (!phoneNumber) {
      throw new BadRequestError("Phone number is required");
    }
    const isCheckPhoneNumberExist = await checkAuth("phoneNumber", phoneNumber);
    if (isCheckPhoneNumberExist)
      throw new ConflictError("Phone number already exists", 409);
    return true;
  }

  static async sendOtp(email) {
    if (!email) {
      throw new BadRequestError("Email is required");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await RegisterService.saveOtp(email, otp);
    await RegisterService.sendOtpEmail(email, otp);
    return otp;
  }

  static async saveOtp(email, otp) {
    await redisClient.set(`otp:${email}`, otp, {
      EX: OTP_TTL,
    });
  }

  static async verifyOTP(email, otp) {
    if (!email || !otp) {
      throw new BadRequestError("Email and OTP are required");
    }
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) return false;
    return storedOtp === otp;
  }

  static async sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email_send, // thay bằng email bạn
        pass: password, // dùng App Password
      },
    });
    const mailOptions = {
      from: `"Your App" <${email_send}>`, // sender address
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);
  }
}
module.exports = RegisterService;
