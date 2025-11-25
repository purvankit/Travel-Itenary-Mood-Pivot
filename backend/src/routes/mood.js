const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');
const Session = require('../models/Session');

// POST /api/mood/update
router.post('/update', async (req, res) => {
  const { sessionId, participantId, mood } = req.body;
  if (!sessionId || !participantId || !mood) return res.status(400).json({ ok:false, err:'missing fields' });
  try {
    // Store the raw mood label from the frontend (relaxed, energetic, adventurous, romantic, cultural, tired, etc.)
    const log = await MoodLog.create({ sessionId, participantId, mood });

    // compute current mood ratio for tired|sick
    const logs = await MoodLog.find({ sessionId }).sort({ timestamp: -1 }).limit(500);
    // find unique latest mood per participant
    const latest = {};
    logs.forEach(l => { latest[l.participantId] = l.mood; });
    const total = Object.keys(latest).length || 1;
    const bad = Object.values(latest).filter(m => m === 'tired' || m === 'sick').length;
    const ratio = bad / total;

    // Just return the updated mood state. The frontend is responsible
    // for triggering any replanning via the /api/replan/propose route.
    res.json({ ok:true, log, moodState: { total, bad, ratio } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok:false, err: err.message });
  }
});

// GET /api/mood/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await MoodLog.find({}).sort({ timestamp: 1 }).limit(1000);
    res.json({ ok: true, logs });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok: false, err: err.message });
  }
});

module.exports = router;
