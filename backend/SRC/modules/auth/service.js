import bcrypt from "bcrypt";
import { AuthRepository } from "./repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import {
  UnauthorizedError,
  ConflictError,
} from "../../common/errors/AppError.js";

export class AuthService {
  authRepository = new AuthRepository();

  async register(userData) {
    const existingEmail = await this.authRepository.findUserByEmail(
      userData.email,
    );
    if (existingEmail) {
      throw new ConflictError("A user with this email address already exists");
    }

    const existingUsername = await this.authRepository.findUserByUsername(
      userData.username,
    );
    if (existingUsername) {
      throw new ConflictError("A user with this username already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const newUser = await this.authRepository.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
      role: "user",
      xp: 0,
      level: 1,
      cash: 100, // $100 starting money
      netWorth: 100,
    });

    return newUser;
  }

  async login(credentials, device, ip) {
    const user = await this.authRepository.findUserByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.authRepository.createRefreshToken(
      user.id,
      refreshToken,
      expiresAt,
      device,
      ip,
    );

    return { user, accessToken, refreshToken };
  }

  async refresh(token, device, ip) {
    // 1. Verify the signature of the refresh token
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // 2. Lookup token in DB to check for reuse/revocation
    const storedToken = await this.authRepository.findRefreshToken(token);

    // Replay attack prevention: if token was already revoked, revoke ALL user's sessions!
    if (!storedToken || storedToken.isRevoked) {
      if (storedToken) {
        await this.authRepository.revokeAllUserTokens(
          storedToken.userId.toString(),
        );
      }
      throw new UnauthorizedError("Token abuse detected. Please log in again");
    }

    // Revoke the used refresh token (RTR)
    await this.authRepository.revokeRefreshToken(token);

    // Generate new pair
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save the new refresh token
    await this.authRepository.createRefreshToken(
      payload.userId,
      newRefreshToken,
      expiresAt,
      device,
      ip,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token) {
    await this.authRepository.revokeRefreshToken(token);
  }
}
