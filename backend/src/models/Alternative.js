const mongoose = require('mongoose');

const AlternativeSchema = new mongoose.Schema({
  name: String,
  type: String,
  lat: Number,
  lng: Number,
  effortScore: Number,
  rating: Number,
  availableSlots: Number,
  costEstimate: Number,
  tags: [String]
});

module.exports = mongoose.model('Alternative', AlternativeSchema);
