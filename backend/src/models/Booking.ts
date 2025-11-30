// backend/src/models/Booking.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface BookingDocument extends Document {
    customerId: string;
    serviceId: string;
    date: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalCost: number;
    paymentMethod: 'cash' | 'orange' | 'mtn' | 'moov';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentDate?: Date;
}

const BookingSchema = new Schema<BookingDocument>({
    customerId: { type: String, required: true, ref: 'User' },
    serviceId: { type: String, required: true, ref: 'Service' },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    totalCost: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'orange', 'mtn', 'moov'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentDate: { type: Date }
}, { timestamps: true });

export const Booking = mongoose.model<BookingDocument>('Booking', BookingSchema);