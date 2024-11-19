const redis = require("ioredis");

const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  retryStrategy(times) {
    if (times > 3) {
      console.log("Redis connection failed after 3 attempts. Not retrying.");
      return null; 
    }
    return Math.min(times * 100, 3000);
  },
};

function connectRedisClient() {
  let redisClient = new redis(redisConfig);

  redisClient.on("error", (err) => {
    console.log("Redis error: " + err);
    // process.exit(1);
  });

  redisClient.on("connect", () => {
    console.log(`Redis is connected`);
  });

  return redisClient;
}

module.exports = {
  connectRedisClient,
};
