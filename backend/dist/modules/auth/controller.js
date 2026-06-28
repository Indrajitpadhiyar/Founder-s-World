import { AuthService } from './service.js';
import { successResponse } from '../../common/responses/response.js';
import { getCookieOptions } from '../../utils/jwt.js';
export class AuthController {
    authService = new AuthService();
    register = async (req, res, next) => {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json(successResponse('User registered successfully', {
                id: user.id,
                username: user.username,
                email: user.email,
            }));
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const device = req.headers['user-agent'];
            const ip = req.ip;
            const { user, accessToken, refreshToken } = await this.authService.login(req.body, device, ip);
            const cookieOpts = getCookieOptions();
            res.cookie('accessToken', accessToken, cookieOpts);
            res.cookie('refreshToken', refreshToken, cookieOpts);
            res.status(200).json(successResponse('Login successful', {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    cash: user.cash,
                    level: user.level,
                    xp: user.xp,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            }));
        }
        catch (error) {
            next(error);
        }
    };
    refresh = async (req, res, next) => {
        try {
            const token = req.cookies?.refreshToken || req.body?.refreshToken;
            const device = req.headers['user-agent'];
            const ip = req.ip;
            const { accessToken, refreshToken } = await this.authService.refresh(token, device, ip);
            const cookieOpts = getCookieOptions();
            res.cookie('accessToken', accessToken, cookieOpts);
            res.cookie('refreshToken', refreshToken, cookieOpts);
            res.status(200).json(successResponse('Token refreshed successfully', {
                tokens: {
                    accessToken,
                    refreshToken,
                },
            }));
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const token = req.cookies?.refreshToken || req.body?.refreshToken;
            if (token) {
                await this.authService.logout(token);
            }
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).json(successResponse('Logged out successfully'));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=controller.js.map