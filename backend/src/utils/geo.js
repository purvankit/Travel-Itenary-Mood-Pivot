// simple Haversine distance
function toRad(deg) {
  return deg * Math.PI / 180;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lat2 || !lon1 || !lon2) return 999;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
            Math.cos(toRad(lat1))*Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = { distanceKm };
