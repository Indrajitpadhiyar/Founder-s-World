import mongoose from "mongoose";
import dns from "dns";
import { env } from "./env.js";
import { logger } from "./logger.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDatabase = async () => {
  try {
    mongoose.connection.on("connecting", () => {
      logger.info("Connecting to MongoDB...");
    });

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully.");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    await mongoose.connect(env.MONGO_URL, {
      maxPoolSize: 100, // Optimize connection pooling for high concurrency
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
