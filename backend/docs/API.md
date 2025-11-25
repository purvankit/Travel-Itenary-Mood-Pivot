# API (brief)

## POST /api/sessions/create
Create session.
Body: { tripName, organizerId, participants[], itinerary[] }
Returns: { ok:true, session }

## GET /api/sessions/:id
Get session object.

## GET /api/itinerary/:sessionId
Returns itinerary for session.

## POST /api/mood/update
Body: { sessionId, participantId, mood } // mood: ok|tired|sick
Will log mood and may return proposals if threshold reached.

## POST /api/replan/propose
Body: { sessionId, affectedBlockId }  
Returns candidate replacements (array).
