import { WorldService } from "./service.js";
import { successResponse } from "../../common/responses/response.js";

const worldService = new WorldService();

export class WorldController {
  getCities = async (req, res, next) => {
    try {
      const cities = await worldService.getAllCities();
      res.json(successResponse("Cities retrieved", cities));
    } catch (err) { next(err); }
  };

  getCityBySlug = async (req, res, next) => {
    try {
      const city = await worldService.getCityBySlug(req.params.slug);
      res.json(successResponse("City details retrieved", city));
    } catch (err) { next(err); }
  };

  getProperties = async (req, res, next) => {
    try {
      const result = await worldService.getPropertiesByCity(req.params.slug, req.query);
      res.json(successResponse("Properties retrieved", result.properties, result.pagination, { cityName: result.cityName }));
    } catch (err) { next(err); }
  };

  getPropertyById = async (req, res, next) => {
    try {
      const property = await worldService.getPropertyById(req.params.id);
      res.json(successResponse("Property retrieved", property));
    } catch (err) { next(err); }
  };

  negotiate = async (req, res, next) => {
    try {
      const result = await worldService.negotiateProperty(req.params.id, req.user.id, req.body);
      res.json(successResponse("Negotiation result", result));
    } catch (err) { next(err); }
  };

  signLease = async (req, res, next) => {
    try {
      const result = await worldService.signLease(req.params.id, req.user.id, req.body);
      res.json(successResponse("Lease signed successfully", result));
    } catch (err) { next(err); }
  };
}
