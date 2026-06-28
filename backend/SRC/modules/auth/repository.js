import { User } from "../users/model.js";
import { RefreshToken } from "./model.js";

export class AuthRepository {
  async findUserByEmail(email) {
    return User.findOne({ email });
  }

  async findUserByUsername(username) {
    return User.findOne({ username });
  }

  async createUser(userData) {
    return User.create(userData);
  }

  async findRefreshToken(token) {
    return RefreshToken.findOne({ token }).populate("userId");
  }

  async createRefreshToken(userId, token, expiresAt, device, ip) {
    return RefreshToken.create({
      userId,
      token,
      expiresAt,
      device,
      ip,
    });
  }

  async revokeRefreshToken(token) {
    await RefreshToken.updateOne({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId) {
    await RefreshToken.updateMany({ userId }, { isRevoked: true });
  }
}
