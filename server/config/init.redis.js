const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  await redisClient.connect();
  console.log("Connected to Redis");
}

module.exports = {
  redisClient,
  connectRedis,
};
