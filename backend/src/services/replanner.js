const Alternative = require('../models/Alternative');
const Session = require('../models/Session');
const geo = require('../utils/geo');
const config = require('../config');

async function scoreCandidate(poi, block) {
  // simple scoring: prefer low effort, higher rating, closer distance, availability
  const distKm = geo.distanceKm(block.location.lat, block.location.lng, poi.lat, poi.lng);
  const distScore = Math.max(0, 1 - (distKm / (config.replanner.radiusKm || 5)));
  const effortScore = 1 - (poi.effortScore || 0); // lower effort -> higher score
  const avail = Math.min(1, (poi.availableSlots || 0) / 10);
  const rating = (poi.rating || 3) / 5;
  // weights
  const score = (0.4 * distScore) + (0.25 * effortScore) + (0.2 * rating) + (0.15 * avail);
  return { poi, score, distKm };
}

async function findCandidates(block) {
  // naive: get many POIs and filter by type-compatible categories
  const raw = await Alternative.find({ type: { $in: compatibleTypes(block.type) } }).limit(100);
  // compute scores
  const scored = await Promise.all(raw.map(async p => await scoreCandidate(p, block)));
  // sort
  scored.sort((a,b) => b.score - a.score);
  return scored;
}

function compatibleTypes(type) {
  // mapping of replacements
  const map = {
    hike: ['cafe','spa','short_walk','viewpoint','museum'],
    meal: ['cafe','restaurant'],
    relax: ['spa','cafe','park'],
    default: ['cafe','museum','spa']
  };
  return map[type] || map.default;
}

async function proposeReplacements(session) {
  if (!session || !session.itinerary) return [];
  // pick next upcoming block with high effort (example)
  const block = session.itinerary.find(b => b.effortScore >= 0.6) || session.itinerary[0];
  if (!block) return [];
  const scored = await findCandidates(block);
  return scored.slice(0, config.replanner.maxProposals || 3).map(s => ({
    id: s.poi._id,
    name: s.poi.name,
    type: s.poi.type,
    score: s.score,
    distanceKm: s.distKm,
    effortScore: s.poi.effortScore,
    rating: s.poi.rating,
    availableSlots: s.poi.availableSlots,
    costEstimate: s.poi.costEstimate
  }));
}

async function proposeReplacementsByBlock(sessionId, blockId) {
  const session = await Session.findById(sessionId);
  if (!session) return [];
  const block = session.itinerary.find(b => b.id === blockId) || session.itinerary[0];
  if (!block) return [];
  const scored = await findCandidates(block);
  return scored.slice(0, config.replanner.maxProposals || 3).map(s => ({
    id: s.poi._id,
    name: s.poi.name,
    type: s.poi.type,
    score: s.score,
    distanceKm: s.distKm,
    effortScore: s.poi.effortScore,
    rating: s.poi.rating,
    availableSlots: s.poi.availableSlots,
    costEstimate: s.poi.costEstimate
  }));
}

module.exports = { proposeReplacements, proposeReplacementsByBlock };
