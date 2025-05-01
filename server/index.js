// index.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const { connectRedis } = require("./config/init.redis.js");
const startRedis = require("./helper/startRedis.js");
const startRestoreStockJob = require("./helper/cronStockProduct.js");
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

app.use("/api/v1", require("./routes/index")); // Use the routes defined in routes/index.js
// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});
startRedis();
startRestoreStockJob();
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
