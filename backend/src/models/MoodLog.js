const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  participantId: String,
  // Accept any mood label sent from the frontend (relaxed, energetic, adventurous, romantic, cultural, tired, sick, etc.)
  mood: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MoodLog', MoodLogSchema);
