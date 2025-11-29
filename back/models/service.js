// src/models/Service.js
const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  dayOfWeek: String,
  startTime: String,
  endTime: String
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  city: String,
  district: String,
  coordinates: {
    latitude: Number, longitude: Number
  }
}, { _id: false });

const ServiceSchema = new mongoose.Schema({
  serviceId: String,
  providerId: String,
  category: String,
  description: String,
  pricing: Number,
  availability: [TimeSlotSchema],
  location: LocationSchema,
  averageRating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Service', ServiceSchema);
