import { City } from "./City.js";
import { Property } from "./Property.js";
import { Character } from "../character/Character.js";
import { Transaction } from "../economy/Transaction.js";
import { NotFoundError, BadRequestError, ConflictError } from "../../common/errors/AppError.js";

export class WorldService {
  // ── Cities ──────────────────────────────────
  async getAllCities() {
    return City.find({}, { districts: 0 }).sort({ population: -1 }).lean();
  }

  async getCityBySlug(slug) {
    const city = await City.findOne({ slug }).lean();
    if (!city) throw new NotFoundError(`City '${slug}' not found`);

    // Attach property counts per district
    const propertyCounts = await Property.aggregate([
      { $match: { cityId: city._id, status: "available" } },
      { $group: { _id: "$districtName", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    propertyCounts.forEach(p => { countMap[p._id] = p.count; });

    city.districts = city.districts.map(d => ({
      ...d,
      availableProperties: countMap[d.name] || 0,
    }));

    // Count total businesses in city
    const totalBusinesses = await Property.countDocuments({ cityId: city._id, status: "rented" });

    return { ...city, totalBusinesses };
  }

  // ── Properties ──────────────────────────────
  async getPropertiesByCity(citySlug, filters = {}) {
    const city = await City.findOne({ slug: citySlug }).lean();
    if (!city) throw new NotFoundError(`City '${citySlug}' not found`);

    const query = { cityId: city._id };

    if (filters.status) query.status = filters.status;
    else query.status = "available"; // default to available

    if (filters.district) query.districtName = filters.district;
    if (filters.type) query.type = filters.type;
    if (filters.maxRent) query.monthlyRent = { $lte: Number(filters.maxRent) };
    if (filters.minSize) query.size = { $gte: Number(filters.minSize) };

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(query).sort({ monthlyRent: 1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(query),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      cityName: city.name,
    };
  }

  async getPropertyById(propertyId) {
    const property = await Property.findById(propertyId)
      .populate("cityId", "name slug state")
      .lean();
    if (!property) throw new NotFoundError("Property not found");
    return property;
  }

  // ── Negotiation ─────────────────────────────
  async negotiateProperty(propertyId, userId, offer) {
    const property = await Property.findById(propertyId);
    if (!property) throw new NotFoundError("Property not found");
    if (property.status !== "available") throw new ConflictError("Property is no longer available");

    const character = await Character.findOne({ userId });
    if (!character) throw new BadRequestError("You must create a character first");

    // Negotiation logic based on character's negotiation skill
    const { offeredRent, offeredDeposit, termMonths } = offer;
    const negotiationSkill = character.skills.negotiation || 5;

    // Calculate minimum acceptable values
    const minRent = property.monthlyRent * 0.7; // Max 30% discount
    const minDeposit = property.deposit * 0.6;   // Max 40% discount

    // Skill-based discount threshold
    const maxDiscount = Math.min(0.3, negotiationSkill / 200); // Up to 30% at skill 60+
    const acceptableRent = property.monthlyRent * (1 - maxDiscount);
    const acceptableDeposit = property.deposit * (1 - maxDiscount);

    if (offeredRent < minRent || offeredDeposit < minDeposit) {
      return {
        accepted: false,
        message: "Your offer is too low. The landlord is offended.",
        counterOffer: {
          rent: Math.round(property.monthlyRent * (1 - maxDiscount * 0.5)),
          deposit: Math.round(property.deposit * (1 - maxDiscount * 0.5)),
        },
      };
    }

    if (offeredRent >= acceptableRent && offeredDeposit >= acceptableDeposit) {
      // Gain XP for successful negotiation
      character.xp += 10;
      if (negotiationSkill < 100) {
        character.skills.negotiation = Math.min(100, negotiationSkill + 1);
      }
      await character.save();

      return {
        accepted: true,
        message: "The landlord accepts your offer!",
        finalTerms: {
          rent: Math.round(offeredRent),
          deposit: Math.round(offeredDeposit),
          termMonths: Math.max(3, Math.min(24, termMonths || 12)),
        },
      };
    }

    // Partial acceptance — counter-offer
    return {
      accepted: false,
      message: "The landlord thinks the offer is fair but wants slightly more.",
      counterOffer: {
        rent: Math.round((offeredRent + acceptableRent) / 2),
        deposit: Math.round((offeredDeposit + acceptableDeposit) / 2),
      },
    };
  }

  // ── Lease Signing ───────────────────────────
  async signLease(propertyId, userId, terms) {
    const property = await Property.findById(propertyId);
    if (!property) throw new NotFoundError("Property not found");
    if (property.status !== "available") throw new ConflictError("Property is no longer available");

    const character = await Character.findOne({ userId });
    if (!character) throw new BadRequestError("You must create a character first");

    const { rent, deposit, termMonths } = terms;
    const totalCost = deposit + rent; // First month rent + deposit

    if (character.cash < totalCost) {
      throw new BadRequestError(
        `Insufficient funds. You need $${totalCost.toFixed(2)} but have $${character.cash.toFixed(2)}.`
      );
    }

    // Deduct money
    character.cash -= totalCost;
    await character.save();

    // Update property
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (termMonths || 12));

    property.status = "rented";
    property.tenantId = userId;
    property.leaseTerms = {
      startDate: now,
      endDate,
      monthlyRent: rent,
      deposit,
      maintenanceFee: Math.round(rent * 0.05),
    };
    await property.save();

    // Record transactions
    await Transaction.create([
      {
        fromUserId: userId,
        toUserId: null,
        type: "deposit",
        amount: deposit,
        description: `Security deposit for ${property.address}`,
        cityId: property.cityId,
      },
      {
        fromUserId: userId,
        toUserId: null,
        type: "rent",
        amount: rent,
        description: `First month rent for ${property.address}`,
        cityId: property.cityId,
      },
    ]);

    return {
      property,
      remainingCash: character.cash,
      message: `Lease signed! You now control ${property.address}. Set up your business!`,
    };
  }
}
