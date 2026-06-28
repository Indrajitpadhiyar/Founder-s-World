import { Character } from "./Character.js";
import { City } from "../world/City.js";
import { User } from "../users/model.js";
import { NotFoundError, BadRequestError, ConflictError } from "../../common/errors/AppError.js";

export class CharacterService {
  async createCharacter(userId, data) {
    // Check if character already exists
    const existing = await Character.findOne({ userId });
    if (existing) throw new ConflictError("Character already exists for this account");

    // Validate city
    const city = await City.findById(data.cityId);
    if (!city) throw new NotFoundError("Selected starting city not found");

    const character = await Character.create({
      userId,
      name: data.name,
      avatar: data.avatar || {},
      cityId: city._id,
      districtName: city.districts[0]?.name || "",
      cash: 100,
      netWorth: 100,
    });

    // Mark user as having a character
    await User.findByIdAndUpdate(userId, { hasCharacter: true });

    return character.toObject();
  }

  async getCharacter(userId) {
    const character = await Character.findOne({ userId })
      .populate("cityId", "name slug state")
      .lean();
    if (!character) return null;
    return character;
  }

  async performAction(userId, action) {
    const character = await Character.findOne({ userId });
    if (!character) throw new NotFoundError("Character not found");

    let message = "";
    let xpGain = 0;

    switch (action) {
      case "eat": {
        if (character.cash < 3) throw new BadRequestError("Not enough money to eat ($3 needed)");
        character.cash -= 3;
        character.needs.hunger = Math.max(0, character.needs.hunger - 40);
        character.needs.energy = Math.min(100, character.needs.energy + 10);
        character.needs.mood = Math.min(100, character.needs.mood + 5);
        message = "You had a meal. Hunger satisfied!";
        xpGain = 2;
        break;
      }
      case "drink": {
        if (character.cash < 1) throw new BadRequestError("Not enough money for a drink ($1 needed)");
        character.cash -= 1;
        character.needs.thirst = Math.max(0, character.needs.thirst - 50);
        character.needs.energy = Math.min(100, character.needs.energy + 5);
        message = "Refreshing! Thirst quenched.";
        xpGain = 1;
        break;
      }
      case "sleep": {
        character.needs.energy = Math.min(100, character.needs.energy + 60);
        character.needs.stress = Math.max(0, character.needs.stress - 20);
        character.needs.health = Math.min(100, character.needs.health + 10);
        character.needs.hunger = Math.min(100, character.needs.hunger + 15);
        character.needs.thirst = Math.min(100, character.needs.thirst + 10);
        message = "You rested well. Energy restored!";
        xpGain = 3;
        break;
      }
      case "exercise": {
        if (character.needs.energy < 20) throw new BadRequestError("Too tired to exercise. Rest first.");
        character.needs.energy = Math.max(0, character.needs.energy - 25);
        character.needs.health = Math.min(100, character.needs.health + 15);
        character.needs.mood = Math.min(100, character.needs.mood + 10);
        character.needs.stress = Math.max(0, character.needs.stress - 15);
        character.needs.hunger = Math.min(100, character.needs.hunger + 10);
        message = "Great workout! Health and mood improved.";
        xpGain = 5;
        break;
      }
      case "shower": {
        character.needs.hygiene = Math.min(100, character.needs.hygiene + 50);
        character.needs.mood = Math.min(100, character.needs.mood + 5);
        message = "Feeling clean and fresh!";
        xpGain = 1;
        break;
      }
      default:
        throw new BadRequestError(`Unknown action: ${action}`);
    }

    // Apply XP and check level-up
    character.xp += xpGain;
    const xpNeeded = character.level * 100;
    if (character.xp >= xpNeeded) {
      character.level += 1;
      character.xp -= xpNeeded;
      message += ` 🎉 Level up! You are now level ${character.level}!`;
    }

    character.lastActionAt = new Date();
    await character.save();

    return {
      character: character.toObject(),
      message,
      xpGain,
    };
  }

  async travelToCity(userId, targetCitySlug) {
    const character = await Character.findOne({ userId }).populate("cityId");
    if (!character) throw new NotFoundError("Character not found");

    const targetCity = await City.findOne({ slug: targetCitySlug });
    if (!targetCity) throw new NotFoundError("Target city not found");

    if (character.cityId._id.equals(targetCity._id)) {
      throw new BadRequestError("You are already in this city");
    }

    // Travel cost based on distance (simplified)
    const travelCost = 10;
    if (character.cash < travelCost) {
      throw new BadRequestError(`Not enough money to travel. Need $${travelCost}.`);
    }

    if (character.needs.energy < 15) {
      throw new BadRequestError("Too tired to travel. Rest first.");
    }

    character.cash -= travelCost;
    character.needs.energy = Math.max(0, character.needs.energy - 15);
    character.cityId = targetCity._id;
    character.districtName = targetCity.districts[0]?.name || "";
    character.xp += 15;

    const xpNeeded = character.level * 100;
    let levelUpMsg = "";
    if (character.xp >= xpNeeded) {
      character.level += 1;
      character.xp -= xpNeeded;
      levelUpMsg = ` 🎉 Level up! You are now level ${character.level}!`;
    }

    await character.save();

    return {
      character: character.toObject(),
      message: `Traveled to ${targetCity.name}! Cost: $${travelCost}.${levelUpMsg}`,
    };
  }
}
