import { Queue } from "bullmq";
import { redisConfig } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

const connectionOpts = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || "6379", 10),
  username: new URL(env.REDIS_URL).username || undefined,
  password: new URL(env.REDIS_URL).password || undefined,
  ...redisConfig,
};

export const simulationQueue = new Queue("simulationQueue", {
  connection: connectionOpts,
});

export const emailQueue = new Queue("emailQueue", {
  connection: connectionOpts,
});

export const initScheduler = async () => {
  logger.info("Initializing BullMQ repeatable jobs scheduler...");

  // Stock market simulation price tick (every 5 seconds)
  await simulationQueue.add(
    "stockMarketTick",
    {},
    {
      repeat: {
        every: 5000, // 5000ms = 5 seconds
      },
      jobId: "stock_tick_job",
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

  // Factory production tick (every 10 seconds)
  await simulationQueue.add(
    "factoryProductionTick",
    {},
    {
      repeat: {
        every: 10000, // 10 seconds
      },
      jobId: "factory_tick_job",
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

  logger.info("BullMQ repeatable jobs scheduled successfully.");
};
