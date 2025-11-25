const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// POST /api/sessions/create
router.post('/create', async (req, res) => {
  try {
    const { tripName, organizerId, participants, itinerary } = req.body;
    const expiresAt = new Date(Date.now() + (process.env.SESSION_TTL_MINUTES||360)*60000);
    const session = new Session({ tripName, organizerId, participants, itinerary, expiresAt });
    await session.save();
    res.json({ ok: true, session });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok:false, err: err.message });
  }
});

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if(!session) return res.status(404).json({ ok:false, err:'not found' });
    res.json({ ok:true, session });
  } catch(err) {
    res.status(500).json({ ok:false, err: err.message });
  }
});

module.exports = router;
