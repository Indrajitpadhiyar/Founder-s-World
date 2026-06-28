import { Schema, model } from "mongoose";

const SkillsSchema = new Schema({
  negotiation: { type: Number, default: 5, min: 0, max: 100 },
  management: { type: Number, default: 5, min: 0, max: 100 },
  marketing: { type: Number, default: 5, min: 0, max: 100 },
  accounting: { type: Number, default: 5, min: 0, max: 100 },
  cooking: { type: Number, default: 0, min: 0, max: 100 },
  crafting: { type: Number, default: 0, min: 0, max: 100 },
  logistics: { type: Number, default: 0, min: 0, max: 100 },
  technology: { type: Number, default: 0, min: 0, max: 100 },
}, { _id: false });

const NeedsSchema = new Schema({
  health: { type: Number, default: 100, min: 0, max: 100 },
  energy: { type: Number, default: 100, min: 0, max: 100 },
  hunger: { type: Number, default: 0, min: 0, max: 100 },   // 0 = full, 100 = starving
  thirst: { type: Number, default: 0, min: 0, max: 100 },    // 0 = hydrated
  mood: { type: Number, default: 70, min: 0, max: 100 },
  stress: { type: Number, default: 10, min: 0, max: 100 },
  hygiene: { type: Number, default: 100, min: 0, max: 100 },
}, { _id: false });

const AvatarSchema = new Schema({
  body: { type: String, default: "default" },
  hair: { type: String, default: "short_black" },
  skin: { type: String, default: "medium" },
  outfit: { type: String, default: "casual_1" },
}, { _id: false });

const CharacterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 30 },
    avatar: { type: AvatarSchema, default: () => ({}) },
    cityId: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    districtName: { type: String, default: "" },
    level: { type: Number, default: 1, min: 1 },
    xp: { type: Number, default: 0, min: 0 },
    skills: { type: SkillsSchema, default: () => ({}) },
    needs: { type: NeedsSchema, default: () => ({}) },
    reputation: { type: Number, default: 10, min: 0, max: 100 },
    cash: { type: Number, default: 100, index: true },
    netWorth: { type: Number, default: 100, index: true },
    isOnline: { type: Boolean, default: false, index: true },
    lastActionAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Leaderboard indexes
CharacterSchema.index({ cash: -1 });
CharacterSchema.index({ netWorth: -1 });
CharacterSchema.index({ level: -1 });

export const Character = model("Character", CharacterSchema);
export default Character;
