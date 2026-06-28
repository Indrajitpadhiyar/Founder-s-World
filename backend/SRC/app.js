import express from "express";
import morgan from "morgan";
import { configureSecurityMiddlewares } from "./middlewares/security.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { successResponse } from "./common/responses/response.js";
import authRoutes from "./modules/auth/routes.js";
import userRoutes from "./modules/users/routes.js";
import businessRoutes from "./modules/business/routes.js";
import stockRoutes from "./modules/stock-market/routes.js";
import factoryRoutes from "./modules/factories/routes.js";
import inventoryRoutes from "./modules/inventory/routes.js";
import mongoose from "mongoose";
import { redisClient } from "./config/redis.js";

const app = express();

// Log requests
app.use(morgan("combined"));

// Rate Limiter
app.use(globalRateLimiter);

// Configure CORS, Helmet, cookie-parser, body limits, compression
configureSecurityMiddlewares(app);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/businesses", businessRoutes);
app.use("/api/v1/stocks", stockRoutes);
app.use("/api/v1/factories", factoryRoutes);
app.use("/api/v1/inventory", inventoryRoutes);

// Health Endpoint
app.get("/api/v1/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  let redisStatus = "down";
  if (redisClient && redisClient.status === "ready") {
    redisStatus = "up";
  }

  res.status(200).json(
    successResponse("System is healthy", {
      status: "up",
      uptime: process.uptime(),
      timestamp: new Date(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    }),
  );
});

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export { app };
export default app;
