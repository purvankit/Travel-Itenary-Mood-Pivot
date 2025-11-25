const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Session = require('../models/Session');
const MoodLog = require('../models/MoodLog');
const { replanEngine } = require('../services/replan_engine');

// Load the same POI dataset used by the replan engine so that
// we can apply a chosen alternative directly from this JSON.
const POI_DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/pois_pune.json'), 'utf8'),
);

async function buildMoodStats(sessionId) {
  const logs = await MoodLog.find({ sessionId }).sort({ timestamp: -1 }).limit(500);
  const latest = {};
  logs.forEach((l) => {
    if (!latest[l.participantId]) {
      latest[l.participantId] = l.mood;
    }
  });

  const stats = {};
  Object.values(latest).forEach((mood) => {
    if (!mood) return;
    stats[mood] = (stats[mood] || 0) + 1;
  });
  return stats;
}

// POST /api/replan/propose
// body: { sessionId, affectedBlockId|null }
router.post('/propose', async (req, res) => {
  try {
    const { sessionId, affectedBlockId } = req.body;
    if (!sessionId) return res.status(400).json({ ok: false, err: 'missing sessionId' });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ ok: false, err: 'session not found' });

    const moodStats = await buildMoodStats(sessionId);

    const block =
      (affectedBlockId &&
        session.itinerary.find(
          (b) => String(b.id) === affectedBlockId || String(b._id) === affectedBlockId,
        )) || session.itinerary[0];

    if (!block) {
      return res.json({ ok: true, proposals: [] });
    }

    const startTime =
      (block.startTime && typeof block.startTime === 'string'
        ? block.startTime.slice(11, 16)
        : '09:00');

    const result = replanEngine({
      sessionId,
      moodStats,
      currentSlot: {
        activityName: block.title,
        activityType: block.type,
        startTime,
      },
      constraints: {
        maxDistanceKm: 8,
        minRating: 4.0,
      },
    });
    const alternatives = result?.alternativesConsidered || [];

    if (!result || alternatives.length === 0) {
      return res.json({ ok: true, proposals: [] });
    }

    const proposals = alternatives.map((p) => ({
      id: p.id,
      name: p.name,
      type: result.newActivity?.type,
    }));

    return res.json({ ok: true, proposals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, err: err.message });
  }
});

// POST /api/replan/apply
// body: { sessionId, affectedBlockId, alternativeId }
router.post('/apply', async (req, res) => {
  try {
    const { sessionId, affectedBlockId, alternativeId } = req.body;
    if (!sessionId || !affectedBlockId || !alternativeId) {
      return res.status(400).json({ ok: false, err: 'missing fields' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, err: 'session not found' });
    }

    const activity = session.itinerary.find(
      (b) => String(b.id) === affectedBlockId || String(b._id) === affectedBlockId,
    );
    if (!activity) {
      return res.status(404).json({ ok: false, err: 'activity not found' });
    }

    // Look up the chosen alternative in the POI dataset.
    const poi = POI_DATA.find(
      (p) => String(p.id) === String(alternativeId),
    );

    if (!poi) {
      return res.status(404).json({ ok: false, err: 'alternative not found' });
    }

    // Update core fields of the activity based on the chosen POI
    activity.title = poi.name;
    activity.type = poi.type;

    if (typeof poi.fatigueLevel === 'number') {
      activity.effortScore = poi.fatigueLevel;
    }

    if (typeof poi.duration === 'number') {
      activity.durationMinutes = poi.duration;
    }

    activity.location = activity.location || {};
    activity.location.name = poi.name;

    await session.save();

    return res.json({ ok: true, session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, err: err.message });
  }
});

module.exports = router;
