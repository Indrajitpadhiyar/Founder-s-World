import { FactoryService } from './service.js';
import { successResponse } from '../../common/responses/response.js';
export class FactoryController {
    factoryService = new FactoryService();
    create = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { name, productId } = req.body;
            const factory = await this.factoryService.createFactory(userId, name, productId);
            res.status(201).json(successResponse('Factory constructed successfully', factory));
        }
        catch (error) {
            next(error);
        }
    };
    list = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const factories = await this.factoryService.getUserFactories(userId);
            res.status(200).json(successResponse('Factories fetched successfully', factories));
        }
        catch (error) {
            next(error);
        }
    };
    upgrade = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const factory = await this.factoryService.upgradeFactory(userId, id);
            res.status(200).json(successResponse('Factory upgraded successfully', factory));
        }
        catch (error) {
            next(error);
        }
    };
    toggle = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const factory = await this.factoryService.toggleProduction(userId, id);
            res.status(200).json(successResponse(`Production ${factory.isProducing ? 'started' : 'stopped'} successfully`, factory));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=controller.js.map