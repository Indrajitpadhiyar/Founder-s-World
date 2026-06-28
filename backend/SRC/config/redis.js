import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const redisConfig = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
};

let redisClient;

export const connectRedis = () => {
  if (redisClient) return redisClient;

  logger.info("Connecting to Redis...");
  redisClient = new Redis(env.REDIS_URL, redisConfig);

  redisClient.on("connect", () => {
    logger.info("Redis connecting...");
  });

  redisClient.on("ready", () => {
    logger.info("Redis connected successfully and is ready.");
  });

  redisClient.on("error", (err) => {
    logger.error(`Redis error: ${err.message}`);
  });

  redisClient.on("close", () => {
    logger.warn("Redis connection closed.");
  });

  return redisClient;
};

export { redisClient };
