import { ZodError } from "zod";
import { AppError } from "../common/errors/AppError.js";
import { errorResponse } from "../common/responses/response.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = undefined;

  logger.error(`Error: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err.name === "ValidationError") {
    // Mongoose Validation Error
    statusCode = 400;
    message = "Database Validation Error";
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  } else if (err.name === "CastError") {
    // Mongoose Cast Error (e.g. invalid ObjectId)
    statusCode = 400;
    message = `Invalid value for path: ${err.path}`;
  } else if (err.code === 11000) {
    // Mongoose Duplicate Key Error
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate key error: A record with this '${field}' already exists.`;
  }

  const responseBody = errorResponse(
    message,
    errors,
    env.NODE_ENV === "development" ? { stack: err.stack } : undefined,
  );

  res.status(statusCode).json(responseBody);
};
