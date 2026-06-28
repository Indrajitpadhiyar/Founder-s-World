import { UserService } from './service.js';
import { successResponse } from '../../common/responses/response.js';
export class UserController {
    userService = new UserService();
    getProfile = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const profile = await this.userService.getUserProfile(userId);
            res.status(200).json(successResponse('Profile fetched successfully', {
                id: profile.id,
                username: profile.username,
                email: profile.email,
                role: profile.role,
                avatar: profile.avatar,
                xp: profile.xp,
                level: profile.level,
                cash: profile.cash,
                netWorth: profile.netWorth,
            }));
        }
        catch (error) {
            next(error);
        }
    };
    getLeaderboard = async (req, res, next) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const leaderboard = await this.userService.getLeaderboard(limit);
            res.status(200).json(successResponse('Leaderboard fetched successfully', leaderboard));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=controller.js.map