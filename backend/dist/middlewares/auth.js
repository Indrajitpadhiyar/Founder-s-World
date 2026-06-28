import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../common/errors/AppError.js';
export const authenticate = (req, res, next) => {
    try {
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            throw new UnauthorizedError('Authentication token missing or invalid');
        }
        const decoded = verifyAccessToken(token);
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        next(new UnauthorizedError('Invalid or expired authentication token'));
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('User authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('You do not have permission to access this resource'));
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map