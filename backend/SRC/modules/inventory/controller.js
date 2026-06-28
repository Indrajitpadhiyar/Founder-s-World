import { InventoryService } from "./service.js";
import { successResponse } from "../../common/responses/response.js";

export class InventoryController {
  inventoryService = new InventoryService();

  createWarehouse = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, location } = req.body;
      const warehouse = await this.inventoryService.createWarehouse(
        userId,
        name,
        location,
      );
      res
        .status(201)
        .json(successResponse("Warehouse constructed successfully", warehouse));
    } catch (error) {
      next(error);
    }
  };

  getWarehouses = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const warehouses = await this.inventoryService.getWarehouses(userId);
      res
        .status(200)
        .json(successResponse("Warehouses fetched successfully", warehouses));
    } catch (error) {
      next(error);
    }
  };

  getInventory = async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const inventory = await this.inventoryService.getInventory(warehouseId);
      res
        .status(200)
        .json(successResponse("Inventory fetched successfully", inventory));
    } catch (error) {
      next(error);
    }
  };
}
