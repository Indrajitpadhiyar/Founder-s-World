import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { redisClient } from "../../config/redis.js";

export class SocketService {
  static io = null;
  static ONLINE_USERS_KEY = "socket:online_players";

  static init(server) {
    if (this.io) return this.io;

    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",")
          : ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.split(" ")[1];
        if (!token) {
          return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };

        next();
      } catch (err) {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", async (socket) => {
      const userId = socket.user?.id;
      logger.info(`🔌 Socket connected: User ${userId} (${socket.id})`);

      if (userId) {
        // Join user-specific room
        socket.join(`user:${userId}`);

        // Track presence in Redis
        if (redisClient) {
          await redisClient.sadd(this.ONLINE_USERS_KEY, userId).catch(() => {});
          const count = await redisClient
            .scard(this.ONLINE_USERS_KEY)
            .catch(() => 0);
          this.broadcast("onlineCount", { count });
        }
      }

      socket.on("disconnect", async () => {
        logger.info(`🔌 Socket disconnected: User ${userId} (${socket.id})`);
        if (userId && redisClient) {
          await redisClient.srem(this.ONLINE_USERS_KEY, userId).catch(() => {});
          const count = await redisClient
            .scard(this.ONLINE_USERS_KEY)
            .catch(() => 0);
          this.broadcast("onlineCount", { count });
        }
      });
    });

    return this.io;
  }

  static broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  static sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  static async getOnlineUsersCount() {
    if (redisClient) {
      return (await redisClient.scard(this.ONLINE_USERS_KEY)) || 0;
    }
    return 0;
  }
}
