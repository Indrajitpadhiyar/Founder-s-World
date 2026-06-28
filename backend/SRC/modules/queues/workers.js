import { Worker } from "bullmq";
import { redisConfig } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { StockMarketService } from "../stock-market/service.js";
import { FactoryService } from "../factories/service.js";
import { SocketService } from "../socket/socket.service.js";

const connectionOpts = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || "6379", 10),
  username: new URL(env.REDIS_URL).username || undefined,
  password: new URL(env.REDIS_URL).password || undefined,
  ...redisConfig,
};

const stockService = new StockMarketService();
const factoryService = new FactoryService();

export const initWorkers = () => {
  logger.info("Starting BullMQ Workers...");

  const simulationWorker = new Worker(
    "simulationQueue",
    async (job) => {
      try {
        if (job.name === "stockMarketTick") {
          // logger.debug('Processing stock market simulation tick...');
          const updatedStocks = await stockService.tickStockSimulation();
          // Broadcast to connected web clients via socket.io
          SocketService.broadcast("stockPriceUpdate", updatedStocks);
        }

        if (job.name === "factoryProductionTick") {
          // logger.debug('Processing factory production tick...');
          const completedProductions = await factoryService.tickFactories();

          // Notify individual users when their factories finish production batches
          completedProductions.forEach((prod) => {
            SocketService.sendToUser(
              prod.userId.toString(),
              "factoryProductionCompleted",
              {
                productName: prod.productName,
                productId: prod.productId,
                warehouseId: prod.warehouseId,
                message: `Your factory completed production of 1 unit of ${prod.productName}!`,
              },
            );
          });
        }
      } catch (err) {
        logger.error(
          `Error in simulation worker job ${job.name}: ${err.message}`,
        );
        throw err;
      }
    },
    { connection: connectionOpts },
  );

  simulationWorker.on("completed", (job) => {
    // logger.debug(`Job ${job.id} completed successfully`);
  });
  simulationWorker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed with error: ${err.message}`);
  });

  logger.info("BullMQ simulation worker pool initialized.");
};
export default initWorkers;
