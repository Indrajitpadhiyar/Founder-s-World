import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
    });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY,
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
export const getCookieOptions = () => {
    const isProduction = env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    };
};
//# sourceMappingURL=jwt.js.map