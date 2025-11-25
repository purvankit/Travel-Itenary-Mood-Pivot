# Testing Checklist (Initial Draft)

## Core API Tests

### 1. Test: Create Session
- Send POST /createSession
- Expect: 200 OK
- Response must include:
  - sessionId
  - status = "created"
  - createdAt

### 2. Test: Update Mood
- Send POST /updateMood
- Expect: 200 OK
- Response must include:
  - status = "ok"
  - received = true

### 3. Test: Get Itinerary
- Send GET /getItinerary/:sessionId
- Expect: 200 OK
- Response must include:
  - sessionId
  - currentMood
  - days[]
  - activities[]
  - updatedAt

## Replan Engine Tests

### 4. Test: Replan Trigger
- Send POST /replan with valid moodStats + currentSlot
- Expect: 200 OK
- Response must include:
  - status = "success"
  - originalActivity
  - newActivity
  - updatedSlot

### 5. Test: Activity Replacement Logic
- Ensure "reasonReplaced" is present when original activity is swapped
- Ensure "newActivity" matches the mood constraints
- Ensure "updatedSlot" times align with newActivity.duration

### 6. Test: Alternatives Provided
- Check that alternativesConsidered exists
- Ensure at least 1 alternative is returned
- Ensure alternatives have:
  - id
  - name
  - score

## Error Handling Tests

### 7. Invalid Session ID
- Send GET /getItinerary/INVALID_ID
- Expect: 404 or error response
- Response must include:
  - status = "error"
  - message = "Session not found"

### 8. Missing Fields
- Send POST /updateMood with missing `sessionId` or `mood`
- Expect: 400 Bad Request
- Response must include:
  - status = "error"
  - message explaining missing fields

### 9. Invalid Mood
- Send POST /updateMood with mood not in supported mood list
- Expect: 400 Bad Request
- Ensure backend rejects unknown moods


## Performance & Load Tests (Lightweight, Hackathon-Safe)

### 10. Multiple Mood Updates
- Rapidly send 5–10 mood updates
- Expect:
  - No crashes
  - Last mood overwrites earlier ones

### 11. Frequent Replan Calls
- Send POST /replan multiple times
- Expect:
  - System remains stable
  - Scoring logic still works
  - Alternatives are returned consistently


## Integration Tests (Backend ↔ Frontend)

### 12. UI Fetch Check
- Frontend requests GET /getItinerary
- Ensure UI displays:
  - Activity list
  - Timeline
  - Map markers

### 13. Mood Button Integration
- Clicking mood button sends POST /updateMood
- Backend stores mood
- UI updates without full reload

### 14. Replan Flow Integration
- Submit mood → Backend replan → UI updates
- The full “demo flow” must work end-to-end

## Final Demo Validation

### 15. Full Demo Run
- Create session
- Show itinerary
- Submit group moods
- Trigger replan
- Show updated itinerary
- Explanation (“Why we replaced X with Y”)
- No crashes, no loading issues