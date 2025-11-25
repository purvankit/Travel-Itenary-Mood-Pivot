const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  startTime: { type: String }, // ISO string
  durationMinutes: { type: Number },
  type: { type: String },
  effortScore: { type: Number },
  location: {
    name: String,
    lat: Number,
    lng: Number,
  },
  status: { type: String, default: 'scheduled' },
  // Per-card list of sub-items for this activity
  items: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true },
    },
  ],
});

const SessionSchema = new mongoose.Schema({
  tripName: String,
  organizerId: String,
  participants: [{ id: String, name: String, role: String }],
  itinerary: [ActivitySchema],
  settings: {
    moodThreshold: { type: Number, default: 0.4 },
    radiusKm: { type: Number, default: 5 }
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

module.exports = mongoose.model('Session', SessionSchema);
