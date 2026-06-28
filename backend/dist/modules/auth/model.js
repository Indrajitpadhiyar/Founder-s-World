import { Schema, model } from 'mongoose';
const RefreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    device: {
        type: String,
    },
    ip: {
        type: String,
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
export const RefreshToken = model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
//# sourceMappingURL=model.js.map