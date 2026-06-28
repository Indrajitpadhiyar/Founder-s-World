import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";

export const configureSecurityMiddlewares = (app) => {
  // 1. Enable Helmet for HTTP headers security
  app.use(helmet());

  // 2. Enable CORS with configurable origins
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : ["http://localhost:3000", "http://localhost:5173"], // Common frontend dev ports
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  // 3. Enable Gzip compression
  app.use(compression());

  // 4. Parse Cookies
  app.use(cookieParser());

  // 5. Parse JSON and URL-encoded bodies with limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
};
