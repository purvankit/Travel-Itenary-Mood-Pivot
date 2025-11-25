// very small mock booking to simulate reservation success/failure
async function book(poiId, timeSlot, partySize=4) {
  // make deterministic: succeed 85% if availableSlots >= partySize
  // (In real system, call provider API)
  const success = Math.random() < 0.85;
  if (success) return { ok:true, bookingId: 'bk_' + Date.now(), provider: poiId, timeSlot, partySize };
  return { ok:false, reason: 'provider_rejected' };
}

module.exports = { book };
