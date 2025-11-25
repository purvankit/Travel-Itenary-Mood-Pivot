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
  const total = Object.values(moodStats).reduce((a, b) => a + b, 0);

  const percentages = {};
  for (const mood in moodStats) {
    percentages[mood] = (moodStats[mood] / total) * 100;
  }

  // Pick mood with highest %
  let dominant = Object.keys(percentages).reduce((a, b) =>
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
      allowedTypes = ["spa", "cafe", "relax", "park", "museum", "indoor"];
      break;

    case "bored":
      allowedTypes = ["fun", "indoor", "scenic", "park"];
      break;

    case "hungry":
      allowedTypes = ["cafe", "dinner"];
      break;

    case "sick":
      allowedTypes = ["relax", "spa", "cafe", "museum"];
      break;

    case "energetic":
      allowedTypes = ["hike", "fun", "indoor"];
      break;

    case "relaxed":
      allowedTypes = ["park", "cafe", "relax", "museum"];
      break;

    default:
      allowedTypes = ["cafe", "park", "relax"];
  }

  // If current activity already fits → no need to replace
  if (allowedTypes.includes(currentSlot.activityType)) {
    return [];
  }

  // Return acceptable types
  return allowedTypes;
}

// -----------------------------------------------------------------------------
// Score POIs (distance + fatigue + rating + mood fit)
// -----------------------------------------------------------------------------
function scorePOI(poi, dominantMood) {
  let distanceScore =
    poi.distanceKm <= 2
      ? 5
      : poi.distanceKm <= 4
      ? 4
      : poi.distanceKm <= 7
      ? 3
      : poi.distanceKm <= 10
      ? 2
      : 1;

  let fatigueScore =
    dominantMood === "tired"
      ? 6 - poi.fatigueLevel // low fatigue = high score
      : poi.fatigueLevel; // energetic → high fatigue is okay

  let ratingScore = poi.rating;

  let moodMatchScore = 0;
  if (dominantMood === "tired" && poi.type === "spa") moodMatchScore = 2;
  if (dominantMood === "hungry" && (poi.type === "cafe" || poi.type === "dinner"))
    moodMatchScore = 2;
  if (dominantMood === "bored" && poi.type === "fun") moodMatchScore = 2;

  return distanceScore + fatigueScore + ratingScore + moodMatchScore;
}

// -----------------------------------------------------------------------------
// Main Replan Engine
// -----------------------------------------------------------------------------
function replanEngine(input) {
  const { sessionId, moodStats, currentSlot, constraints } = input;

  const { dominant, percentages } = getDominantMood(moodStats);

  const allowedTypes = filterByMood(dominant, currentSlot);

  // If no change needed
  if (allowedTypes.length === 0) {
    return {
      sessionId,
      status: "no_change",
      message: "The current activity is already suitable for the group's mood."
    };
  }

  // Filter dataset by allowed types
  let candidates = POI_DATA.filter((poi) =>
    allowedTypes.includes(poi.type)
  );

  // Soft constraints
  const maxDist = constraints?.maxDistanceKm || 8;
  const minRating = constraints?.minRating || 4.0;

  candidates = candidates.filter(
    (poi) => poi.distanceKm <= maxDist && poi.rating >= minRating
  );

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
