import mongoose from 'mongoose';

const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1800
    }
});

// Define a static method to check if a token is blacklisted
blackListTokenSchema.statics.isTokenBlacklisted = async function (token) {
    const blacklistedToken = await this.findOne({ token });
    return !!blacklistedToken; // Returns true if found, false otherwise
};

// Avoid overwriting the model if it already exists
const BlacklistToken = mongoose.models.BlacklistToken || mongoose.model('BlacklistToken', blackListTokenSchema);

export default BlacklistToken;