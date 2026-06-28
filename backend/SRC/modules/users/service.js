import { User } from "./model.js";
import { NotFoundError } from "../../common/errors/AppError.js";
import { redisClient } from "../../config/redis.js";

export class UserService {
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }
    return user;
  }

  async getLeaderboard(limit = 10) {
    const LEADERBOARD_KEY = "leaderboard:wealth";

    // 1. Try to read from Redis sorted set
    if (redisClient) {
      try {
        const topUsers = await redisClient.zrevrange(
          LEADERBOARD_KEY,
          0,
          limit - 1,
          "WITHSCORES",
        );
        if (topUsers.length > 0) {
          const results = [];
          for (let i = 0; i < topUsers.length; i += 2) {
            const username = topUsers[i];
            const netWorth = parseFloat(topUsers[i + 1]);
            results.push({ username, netWorth });
          }
          return results;
        }
      } catch (err) {
        // Fallback to MongoDB if Redis fails
      }
    }

    // 2. Fallback to Database query
    const dbUsers = await User.find()
      .sort({ netWorth: -1 })
      .limit(limit)
      .select("username netWorth level");

    // 3. Seed Redis cache in background
    if (redisClient && dbUsers.length > 0) {
      const pipeline = redisClient.pipeline();
      dbUsers.forEach((user) => {
        pipeline.zadd(LEADERBOARD_KEY, user.netWorth, user.username);
      });
      pipeline.expire(LEADERBOARD_KEY, 300); // cache for 5 minutes
      await pipeline.exec().catch(() => {});
    }

    return dbUsers;
  }

  async addWealth(userId, amount) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { cash: amount, netWorth: amount } },
      { new: true },
    );
    if (user && redisClient) {
      await redisClient
        .zadd("leaderboard:wealth", user.netWorth, user.username)
        .catch(() => {});
    }
  }

  async saveGameState(userId, gameStateString) {
    const user = await User.findByIdAndUpdate(
      userId,
      { gameState: gameStateString },
      { new: true }
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getGameState(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user.gameState;
  }
}
