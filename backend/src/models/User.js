// backend/src/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    city: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { _id: false });

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['customer', 'provider'],
        required: true
    },
    location: {
        type: LocationSchema,
        required: true
    },
    profileImage: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    google: {
        id: String,
        provider: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
