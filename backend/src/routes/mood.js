const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');
const Session = require('../models/Session');
const replanner = require('../services/replanner');

// POST /api/mood/update
router.post('/update', async (req, res) => {
  const { sessionId, participantId, mood } = req.body;
  if (!sessionId || !participantId || !mood) return res.status(400).json({ ok:false, err:'missing fields' });
  try {
    const log = await MoodLog.create({ sessionId, participantId, mood });

    // compute current mood ratio for tired|sick
    const logs = await MoodLog.find({ sessionId }).sort({ timestamp: -1 }).limit(500);
    // find unique latest mood per participant
    const latest = {};
    logs.forEach(l => { latest[l.participantId] = l.mood; });
    const total = Object.keys(latest).length || 1;
    const bad = Object.values(latest).filter(m => m === 'tired' || m === 'sick').length;
    const ratio = bad / total;

    // if threshold exceeded, trigger replanner (non-blocking)
    const session = await Session.findById(sessionId);
    const threshold = (session && session.settings && session.settings.moodThreshold) || 0.4;
    if (ratio >= threshold) {
      // call replanner to get proposals for affected block(s)
      // We return proposals for the frontend (non-persistent) - frontend decides to accept
      const proposals = await replanner.proposeReplacements(session);
      // Optionally emit via websocket if implemented:
      // const io = req.app.locals.io; if (io) io.to(sessionId).emit('replanProposals', proposals);
      return res.json({ ok:true, log, moodState: { total, bad, ratio }, proposals });
    }

    res.json({ ok:true, log, moodState: { total, bad, ratio } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok:false, err: err.message });
  }
});

module.exports = router;
