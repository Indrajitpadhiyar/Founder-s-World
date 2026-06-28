import { Schema, model } from 'mongoose';
const FactorySchema = new Schema({
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
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    machinesCount: {
        type: Number,
        default: 1,
    },
    workersCount: {
        type: Number,
        default: 2,
    },
    upgradeLevel: {
        type: Number,
        default: 1,
    },
    efficiency: {
        type: Number,
        default: 100, // starting efficiency
        min: 0,
        max: 100,
    },
    isProducing: {
        type: Boolean,
        default: false,
        index: true,
    },
    productionProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    lastTickAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
export const Factory = model('Factory', FactorySchema);
export default Factory;
//# sourceMappingURL=model.js.map