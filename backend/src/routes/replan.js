const express = require('express');
const router = express.Router();
const replanner = require('../services/replanner');

// POST /api/replan/propose
// body: { sessionId, affectedBlockId }
router.post('/propose', async (req, res) => {
  try {
    const { sessionId, affectedBlockId } = req.body;
    if (!sessionId) return res.status(400).json({ ok:false, err:'missing sessionId' });
    const proposals = await replanner.proposeReplacementsByBlock(sessionId, affectedBlockId);
    res.json({ ok:true, proposals });
  } catch(err) {
    console.error(err);
    res.status(500).json({ ok:false, err: err.message });
  }
});

module.exports = router;
