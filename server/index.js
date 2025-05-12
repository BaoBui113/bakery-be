// index.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;
const compression = require("compression");
const helmet = require("helmet");

const { connectRedis } = require("./config/init.redis.js");
const startRedis = require("./helper/startRedis.js");
const startRestoreStockJob = require("./helper/cronStockProduct.js");
const morgan = require("morgan");
const logger = require("./logger/index.js");
require("dotenv").config();
require("./config/init.mongo.js"); // Initialize MongoDB connection
// Middleware (optional)
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(
    (tokens, req, res) => {
      return `Incoming request: ${tokens.method(req, res)} ${tokens.url(
        req,
        res
      )} Status: ${tokens.status(req, res)} - ${tokens["response-time"](
        req,
        res
      )} ms`;
    },
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }
  )
);

app.use("/api/v1", require("./routes/index")); // Use the routes defined in routes/index.js
// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});
startRedis();
startRestoreStockJob();

// Middleware log lỗi chi tiết
app.use((err, req, res, next) => {
  const { method, originalUrl, body, query, params } = req;

  logger.error(
    `Error at ${method} ${originalUrl} - ${
      err.message
    } - body: ${JSON.stringify(body)} - query: ${JSON.stringify(
      query
    )} - params: ${JSON.stringify(params)}`
  );

  next(err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
