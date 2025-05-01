const { connectRedis } = require("../config/init.redis");
const startRedis = async () => {
  try {
    await connectRedis();
    console.log("Redis server started successfully");
  } catch (error) {
    console.error("Error starting Redis server:", error);
  }
};
module.exports = startRedis;
