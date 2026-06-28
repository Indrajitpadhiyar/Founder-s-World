import { Schema, model } from 'mongoose';
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    baseCost: {
        type: Number,
        required: true,
        default: 0,
    },
    basePrice: {
        type: Number,
        required: true,
        default: 0,
    },
    demandFactor: {
        type: Number,
        default: 1.0, // Multiplier for simulation engine
    },
    popularity: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
});
export const Product = model('Product', ProductSchema);
export default Product;
//# sourceMappingURL=model.js.map