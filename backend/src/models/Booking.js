// backend/src/models/Booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    customerId: { type: String, required: true, ref: 'User' },
    serviceId: { type: String, required: true, ref: 'Service' },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    totalCost: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'orange', 'mtn', 'moov'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentDate: { type: Date }
}, { timestamps: true });

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = { Booking };
