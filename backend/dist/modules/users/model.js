import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    avatar: {
        type: String,
        default: '',
    },
    xp: {
        type: Number,
        default: 0,
        index: true,
    },
    level: {
        type: Number,
        default: 1,
    },
    cash: {
        type: Number,
        default: 100000, // Starting cash (e.g. $100k)
        index: true,
    },
    netWorth: {
        type: Number,
        default: 100000,
        index: true,
    },
}, {
    timestamps: true,
});
// Indexes for sorting/ranking players
UserSchema.index({ netWorth: -1 });
UserSchema.index({ cash: -1 });
export const User = model('User', UserSchema);
export default User;
//# sourceMappingURL=model.js.map