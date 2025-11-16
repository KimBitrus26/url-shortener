const Redis = require("ioredis");

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis Error:", err);
});

module.exports = client;
