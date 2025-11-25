const mongoose = require('mongoose');
require('dotenv').config();
const Alternative = require('../src/models/Alternative');

const data = [
  { name: 'Nearby Cafe A', type:'cafe', lat:18.5204, lng:73.8567, effortScore:0.1, rating:4.4, availableSlots:10, costEstimate:200, tags:['cozy','wifi'] },
  { name: 'Spa Relax', type:'spa', lat:18.518, lng:73.855, effortScore:0.05, rating:4.7, availableSlots:3, costEstimate:1200, tags:['relax'] },
  { name: 'City Museum', type:'museum', lat:18.521, lng:73.857, effortScore:0.2, rating:4.3, availableSlots:20, costEstimate:150, tags:['indoor'] },
  { name: 'Short Scenic Walk', type:'short_walk', lat:18.522, lng:73.86, effortScore:0.15, rating:4.2, availableSlots:30, costEstimate:0, tags:['outdoor'] },
  { name: 'Local Restaurant B', type:'restaurant', lat:18.519, lng:73.85, effortScore:0.2, rating:4.1, availableSlots:8, costEstimate:300, tags:['dinner'] }
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ Missing MONGO_URI in .env');
      process.exit(1);
    }

    console.log('🌱 Connecting to MongoDB...');
    
    // *** CORRECT CONNECTION FOR MONGOOSE v9 ***
    await mongoose.connect(process.env.MONGO_URI);

    console.log('🌱 Connected. Seeding alternatives...');
    await Alternative.deleteMany({});
    await Alternative.insertMany(data);

    console.log(`✅ Seeded alternatives: ${data.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
