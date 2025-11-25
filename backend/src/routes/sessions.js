const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// POST /api/sessions/create
router.post('/create', async (req, res) => {
  try {
    const { tripName, organizerId, participants, itinerary, name, locationName } = req.body;

    // Fallbacks so minimal frontend payload still creates a useful demo session
    const effectiveTripName = tripName || name || 'MoodPivot Live Demo';

    const defaultParticipants =
      participants && participants.length
        ? participants
        : [
            { id: 'p1', name: 'Host', role: 'organizer' },
            { id: 'p2', name: 'Guest', role: 'member' },
          ];

    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    const defaultItinerary =
      itinerary && itinerary.length
        ? itinerary
        : [
            {
              id: 'act-1',
              title: effectiveTripName || 'Your Trip',
              startTime,
              durationMinutes: 90,
              type: 'walk',
              effortScore: 0.6,
              location: {
                name: locationName || effectiveTripName || 'Starting point',
                lat: 19.076,
                lng: 72.8777,
              },
              status: 'scheduled',
            },
          ];

    const expiresAt = new Date(Date.now() + (process.env.SESSION_TTL_MINUTES || 360) * 60000);
    const session = new Session({
      tripName: effectiveTripName,
      organizerId: organizerId || 'web-ui',
      participants: defaultParticipants,
      itinerary: defaultItinerary,
      expiresAt,
    });
    await session.save();
    res.json({ ok: true, session });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok:false, err: err.message });
  }
});

// PUT /api/sessions/:sessionId/itinerary/:activityId/items
router.put('/:sessionId/itinerary/:activityId/items', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ ok: false, err: 'items must be an array' });
    }

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, err: 'session not found' });
    }

    const activity = session.itinerary.find(
      (a) => String(a.id) === req.params.activityId || String(a._id) === req.params.activityId,
    );

    if (!activity) {
      return res.status(404).json({ ok: false, err: 'activity not found' });
    }

    activity.items = items
      .map((item, index) => ({
        id: item.id || `item-${index + 1}`,
        text: String(item.text || '').trim(),
      }))
      .filter((i) => i.text.length > 0);

    await session.save();

    return res.json({ ok: true, session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, err: err.message });
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

// PUT /api/sessions/:id/itinerary
router.put('/:id/itinerary', async (req, res) => {
  try {
    const { itinerary } = req.body;
    if (!Array.isArray(itinerary)) {
      return res.status(400).json({ ok: false, err: 'itinerary must be an array' });
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { itinerary },
      { new: true },
    );

    if (!session) return res.status(404).json({ ok: false, err: 'not found' });

    res.json({ ok: true, session });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
});

module.exports = router;
