// =============================================
// Replan Engine (Dhruvil) - Mood Pivot Logic
// =============================================

const fs = require("fs");
const path = require("path");

// Load POI Dataset ------------------------------------------------------------
const POI_DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/pois_pune.json"), "utf8")
);

// -----------------------------------------------------------------------------
// Utility: Calculate % distribution of moods
// -----------------------------------------------------------------------------
function getDominantMood(moodStats) {
  const entries = Object.entries(moodStats || {});
  // Fallback: no mood logs yet → treat as relaxed 100%
  if (!entries.length) {
    return {
      dominant: "relaxed",
      percentages: { relaxed: 100 },
    };
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  // Guard against divide-by-zero
  if (!total) {
    return {
      dominant: "relaxed",
      percentages: { relaxed: 100 },
    };
  }

  const percentages = {};
  for (const [mood, value] of entries) {
    percentages[mood] = (value / total) * 100;
  }

  // Pick mood with highest %
  const dominant = Object.keys(percentages).reduce((a, b) =>
    percentages[a] > percentages[b] ? a : b
  );

  return { dominant, percentages };
}

// -----------------------------------------------------------------------------
// Match POIs based on mood rules
// -----------------------------------------------------------------------------
function filterByMood(dominantMood, currentSlot) {
  let allowedTypes = [];

  switch (dominantMood) {
    case "tired":
      // Very low-effort recovery stops
      allowedTypes = ["spa", "relax", "cafe"];
      break;

    case "energetic":
      // High-energy, playful activities
      allowedTypes = ["fun", "indoor"];
      break;

    case "relaxed":
      // Gentle, quiet spaces
      allowedTypes = ["relax", "park"];
      break;

    case "romantic":
      // Date-night style: dinners & scenic views
      allowedTypes = ["dinner", "scenic"];
      break;

    case "cultural":
      // Strong focus on museums and culture
      allowedTypes = ["museum"];
      break;

    // Frontend: adventurous → bolder outdoors
    case "adventurous":
      allowedTypes = ["hike", "scenic"];
      break;

    case "bored":
      allowedTypes = ["fun", "park"];
      break;

    case "hungry":
      allowedTypes = ["dinner", "cafe"];
      break;

    case "sick":
      allowedTypes = ["spa", "relax"];
      break;

    default:
      allowedTypes = ["cafe", "park", "relax"];
  }

  // Always return acceptable types. Even if the current activity already fits,
  // we still want to propose alternative options for the user.
  return allowedTypes;
}

// -----------------------------------------------------------------------------
// Score POIs (distance + fatigue + rating + mood fit)
// -----------------------------------------------------------------------------
function scorePOI(poi, dominantMood) {

  // -------------------------
  // 1) Distance Score (1–5)
  // -------------------------
  let distanceScore =
    poi.distanceKm <= 2 ? 5 :
    poi.distanceKm <= 4 ? 4 :
    poi.distanceKm <= 7 ? 3 :
    poi.distanceKm <= 10 ? 2 : 1;

  // -------------------------
  // 2) Rating Score (1–5)
  // -------------------------
  let ratingScore = poi.rating;

  // -------------------------
  // 3) FatigueMatch Score (+2 if type fits mood)
  // -------------------------
  let fatigueMatchScore = 0;

  if (dominantMood === "tired" && ["spa", "relax", "cafe", "park"].includes(poi.type))
    fatigueMatchScore = 2;

  if (dominantMood === "bored" && ["fun", "indoor", "scenic"].includes(poi.type))
    fatigueMatchScore = 2;

  if (dominantMood === "hungry" && ["cafe", "dinner"].includes(poi.type))
    fatigueMatchScore = 2;

  if (dominantMood === "sick" && ["relax", "spa", "museum"].includes(poi.type))
    fatigueMatchScore = 2;

  if (dominantMood === "energetic" && ["hike", "fun", "indoor"].includes(poi.type))
    fatigueMatchScore = 2;

  // ---------------------------------------------------------
  // FINAL SCORE = distanceScore + ratingScore + fatigueMatchScore
  // ---------------------------------------------------------
  return distanceScore + ratingScore + fatigueMatchScore;
}


// -----------------------------------------------------------------------------
// Main Replan Engine
// -----------------------------------------------------------------------------
function replanEngine(input) {
  const { sessionId, moodStats, currentSlot, constraints } = input;

  const { dominant, percentages } = getDominantMood(moodStats);

  const allowedTypes = filterByMood(dominant, currentSlot);

  // Soft constraints
  const maxDist = constraints?.maxDistanceKm || 8;
  const minRating = constraints?.minRating || 4.0;

  // Step 1: Filter candidates
let candidates = POI_DATA.filter((poi) =>
  allowedTypes.includes(poi.type) &&
  poi.distanceKm <= maxDist &&
  poi.rating >= minRating
);

// 🔥 Fallback A: No candidates? Try only low-fatigue relaxing activities
if (candidates.length === 0) {
  candidates = POI_DATA.filter(poi =>
    ["spa", "relax", "cafe"].includes(poi.type)
  );
}

// 🔥 Fallback B: Still empty? Try any POI with fatigue ≤ 2
if (candidates.length === 0) {
  candidates = POI_DATA.filter(poi => poi.fatigueLevel <= 2);
}

// 🔥 Fallback C: Absolute fallback → pick the closest POI
if (candidates.length === 0) {
  candidates = [...POI_DATA].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5);
}

  // Score all candidates
  const scored = candidates.map((poi) => ({
    ...poi,
    score: scorePOI(poi, dominant)
  }));

  if (scored.length === 0) {
    return {
      sessionId,
      status: "no_alternative_found",
      message: "No suitable alternative activity found for the given mood."
    };
  }

  // Select best POI
  const best = scored.sort((a, b) => b.score - a.score)[0];

  // Calculate adjusted end time
  const start = currentSlot.startTime;
  const end = addDuration(start, best.duration);

  return {
    sessionId,
    status: "success",

    originalActivity: {
      activityName: currentSlot.activityName,
      activityType: currentSlot.activityType,
      reasonReplaced: `Current activity not suitable for dominant mood: '${dominant}'`
    },

    newActivity: best,

    updatedSlot: {
      startTime: start,
      endTime: end,
      activityType: best.type
    },

    alternativesConsidered: scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // top 5
      .map((p) => ({ id: p.id, name: p.name, score: p.score })),

    debug: {
      dominantMood: dominant,
      moodPercentages: percentages,
      allowedTypes
    }
  };
}

// -----------------------------------------------------------------------------
// Helper: Add duration to HH:MM
// -----------------------------------------------------------------------------
function addDuration(startTime, minutes) {
  let [h, m] = startTime.split(":").map(Number);
  let total = h * 60 + m + minutes;

  let hh = Math.floor(total / 60);
  let mm = total % 60;

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Export
module.exports = { replanEngine };
