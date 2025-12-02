// backend/src/models/Service.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimeSlotSchema = new Schema({
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
}, { _id: false });

const LocationSchema = new Schema({
    city: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { _id: false });

const ServiceSchema = new Schema({
    providerId: {
        type: String,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pricing: {
        type: Number,
        required: true,
        min: 0
    },
    availability: [TimeSlotSchema],
    location: {
        type: LocationSchema,
        required: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = { Service };
