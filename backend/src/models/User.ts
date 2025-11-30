// backend/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
    email: string;
    password?: string;
    name: string;
    phone: string;
    userType: 'customer' | 'provider';
    location: {
        city: string;
        district: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    profileImage?: string;
    isVerified?: boolean;
    googleId?: string;
    createdAt: Date;
}

const LocationSchema = new Schema({
    city: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { _id: false });

const UserSchema = new Schema<UserDocument>({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const User = mongoose.model<UserDocument>('User', UserSchema);
