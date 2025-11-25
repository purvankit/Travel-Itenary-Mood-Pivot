# MoodPivot Demo Flow (Backend)

## 1. Create Session
- Method: POST  
- URL: `http://localhost:4000/api/sessions/create`  
- Body (example):
```json
{
  "tripName": "Goa Chill Trip",
  "organizerId": "org-1",
  "participants": [
    { "id": "p1", "name": "Alice", "role": "member" },
    { "id": "p2", "name": "Bob", "role": "member" }
  ],
  "itinerary": [
    {
      "id": "act-1",
      "title": "Beach Walk",
      "startTime": "2025-11-26T09:00:00Z",
      "durationMinutes": 90,
      "type": "outdoor",
      "effortScore": 3,
      "location": { "name": "Baga Beach", "lat": 15.552, "lng": 73.751 },
      "status": "scheduled"
    }
  ]
}