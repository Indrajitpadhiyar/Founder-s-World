import { Schema, model } from 'mongoose';
const BusinessSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['retail', 'tech', 'agriculture', 'manufacturing', 'energy'],
        required: true,
    },
    level: {
        type: Number,
        default: 1,
    },
    revenueRate: {
        type: Number,
        default: 1000, // $1000 per minute at level 1
    },
    expenseRate: {
        type: Number,
        default: 200, // $200 per minute upkeep
    },
    isAutomated: {
        type: Boolean,
        default: false,
    },
    reputation: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
    },
    marketShare: {
        type: Number,
        default: 0.1, // 0.1% starting share
    },
    employeesCount: {
        type: Number,
        default: 0,
    },
    lastCollectedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
BusinessSchema.index({ userId: 1, category: 1 });
export const Business = model('Business', BusinessSchema);
export default Business;
//# sourceMappingURL=model.js.map