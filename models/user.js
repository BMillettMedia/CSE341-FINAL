// src/models/User.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  city: String,
  district: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  userId: String,
  email: { type: String, index: true },
  passwordHash: String, // if you implement local auth later
  name: String,
  phone: String,
  userType: { type: String, enum: ['customer', 'provider'], default: 'customer' },
  location: LocationSchema,
  createdAt: { type: Date, default: Date.now },
  profileImage: String,
  isVerified: { type: Boolean, default: false },
  google: {
    id: String,
    provider: String
  }
});

module.exports = mongoose.model('User', UserSchema);
