const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  participantId: String,
  mood: { type: String, enum: ['ok','tired','sick'] },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MoodLog', MoodLogSchema);
