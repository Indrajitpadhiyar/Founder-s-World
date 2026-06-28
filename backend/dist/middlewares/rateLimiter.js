import rateLimit from 'express-rate-limit';
import { errorResponse } from '../common/responses/response.js';
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    handler: (req, res) => {
        res.status(429).json(errorResponse('Too many requests from this IP, please try again after 15 minutes'));
    },
});
export const authRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10, // Limit each IP to 10 auth requests per hour
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(errorResponse('Too many authentication attempts. Please try again after an hour'));
    },
});
//# sourceMappingURL=rateLimiter.js.map