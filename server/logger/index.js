const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const logDir = path.join(__dirname, "../logs");

const errorRotateTransport = new DailyRotateFile({
  filename: "error-%DATE%.log",
  dirname: logDir,
  level: "error", // 💥 Chỉ log lỗi
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = createLogger({
  level: "info", // Ngưỡng thấp nhất để Winston xử lý
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({ timestamp, level, message }) =>
        `[${timestamp}] [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new transports.Console({
      level: "info", // Hiện ra console khi level >= info
    }),
    errorRotateTransport, // 💾 Ghi lỗi ra file theo ngày
  ],
});

module.exports = logger;
