import { CharacterService } from "./service.js";
import { successResponse } from "../../common/responses/response.js";

const characterService = new CharacterService();

export class CharacterController {
  create = async (req, res, next) => {
    try {
      const character = await characterService.createCharacter(req.user.id, req.body);
      res.status(201).json(successResponse("Character created!", character));
    } catch (err) { next(err); }
  };

  get = async (req, res, next) => {
    try {
      const character = await characterService.getCharacter(req.user.id);
      if (!character) {
        return res.json(successResponse("No character found", null));
      }
      res.json(successResponse("Character retrieved", character));
    } catch (err) { next(err); }
  };

  action = async (req, res, next) => {
    try {
      const result = await characterService.performAction(req.user.id, req.body.action);
      res.json(successResponse(result.message, result.character, null, { xpGain: result.xpGain }));
    } catch (err) { next(err); }
  };

  travel = async (req, res, next) => {
    try {
      const result = await characterService.travelToCity(req.user.id, req.body.citySlug);
      res.json(successResponse(result.message, result.character));
    } catch (err) { next(err); }
  };
}
