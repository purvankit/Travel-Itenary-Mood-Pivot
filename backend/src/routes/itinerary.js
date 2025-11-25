const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// GET /api/itinerary/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const s = await Session.findById(req.params.sessionId);
    if(!s) return res.status(404).json({ ok:false, err:'not found' });
    res.json({ ok:true, itinerary: s.itinerary, sessionId: s._id });
  } catch(err) {
    res.status(500).json({ ok:false, err: err.message });
  }
});

module.exports = router;
