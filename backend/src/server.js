require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const sessionsRoute = require('./routes/sessions');
const moodRoute = require('./routes/mood');
const itineraryRoute = require('./routes/itinerary');
const replanRoute = require('./routes/replan');

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/sessions', sessionsRoute);
app.use('/api/mood', moodRoute);
app.use('/api/itinerary', itineraryRoute);
app.use('/api/replan', replanRoute);

// static assets (optional)
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// health
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 4000;

// *** CORRECT CONNECTION FOR MONGOOSE v9 ***
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const server = app.listen(PORT, () =>
      console.log(`Server running on ${PORT}`)
    );

    // OPTIONAL socket.io (only if installed)
    // const { Server } = require('socket.io');
    // const io = new Server(server, { cors: { origin: "*" } });
    // app.locals.io = io;
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
