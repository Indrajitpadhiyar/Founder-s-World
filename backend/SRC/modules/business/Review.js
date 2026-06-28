import { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

// One review per user per business
ReviewSchema.index({ businessId: 1, authorId: 1 }, { unique: true });

export const Review = model("Review", ReviewSchema);
export default Review;
