import { BusinessService } from './service.js';
import { successResponse } from '../../common/responses/response.js';
export class BusinessController {
    businessService = new BusinessService();
    create = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { name, category } = req.body;
            const business = await this.businessService.createBusiness(userId, name, category);
            res.status(201).json(successResponse('Business created successfully', business));
        }
        catch (error) {
            next(error);
        }
    };
    list = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const businesses = await this.businessService.getUserBusinesses(userId);
            res.status(200).json(successResponse('Businesses fetched successfully', businesses));
        }
        catch (error) {
            next(error);
        }
    };
    upgrade = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const business = await this.businessService.upgradeBusiness(userId, id);
            res.status(200).json(successResponse('Business upgraded successfully', business));
        }
        catch (error) {
            next(error);
        }
    };
    collect = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const result = await this.businessService.collectRevenue(userId, id);
            res.status(200).json(successResponse(`Accrued profit of $${result.collectedAmount} collected`, result));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=controller.js.map