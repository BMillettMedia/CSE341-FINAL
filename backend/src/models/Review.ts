// backend/src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ReviewDocument extends Document {
    bookingId: string;
    customerId: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>({
    bookingId: { type: String, required: true, ref: 'Booking' },
    customerId: { type: String, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Review = mongoose.model<ReviewDocument>('Review', ReviewSchema);