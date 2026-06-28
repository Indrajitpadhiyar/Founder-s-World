import { SupplyService } from "./service.js";
import { successResponse } from "../../common/responses/response.js";

const supplyService = new SupplyService();

export class SupplyController {
  getItems = async (req, res, next) => {
    try {
      const items = await supplyService.getAllItems(req.query);
      res.json(successResponse("Supply items retrieved", items));
    } catch (err) { next(err); }
  };

  getItemsForBusiness = async (req, res, next) => {
    try {
      const items = await supplyService.getItemsForBusiness(req.params.category);
      res.json(successResponse("Supply items for category", items));
    } catch (err) { next(err); }
  };

  purchase = async (req, res, next) => {
    try {
      const result = await supplyService.purchaseSupply(req.user.id, req.body);
      res.json(successResponse(result.message, result));
    } catch (err) { next(err); }
  };
}
