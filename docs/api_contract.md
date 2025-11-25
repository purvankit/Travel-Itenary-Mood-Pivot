# API Contract (Start)

## Endpoints
- POST /createSession
- POST /updateMood
- GET /getItinerary/:sessionId
- POST /replan

## Data Models
(To be filled)

## Request & Response Formats

### POST /createSession

**Request Body**
{
  "groupName": "Goa Trip",
  "days": [
    {
      "date": "2025-11-25",
      "activities": []
    }
  ]
}

**Response Body**
{
  "sessionId": "TRIP_2025_001",
  "status": "created",
  "createdAt": "2025-11-25T10:15:00Z"
}


### POST /updateMood

**Request Body**
{
  "sessionId": "TRIP_2025_001",
  "userId": "USER_12",
  "mood": "tired",
  "timestamp": "2025-11-25T10:22:00Z"
}

**Response Body**
{
  "status": "ok",
  "received": true
}

### GET /getItinerary/:sessionId

**Response Body**
{
  "sessionId": "TRIP_2025_001",

  "currentMood": {
    "mood": "tired",
    "updatedAt": "2025-11-25T10:22:00Z"
  },

  "days": [
    {
      "date": "2025-11-25",
      "activities": []
    }
  ],

  "updatedAt": "2025-11-25T10:23:00Z"
}

### POST /replan

**Request Body**
{
  "sessionId": "TRIP_2025_001",
  "timestamp": "2025-11-25T10:15:00Z",

  "moodStats": {
    "tired": 3,
    "bored": 1,
    "hungry": 2,
    "sick": 0,
    "energetic": 1,
    "relaxed": 0
  },

  "currentSlot": {
    "startTime": "10:00",
    "endTime": "12:00",
    "activityId": "A12",
    "activityType": "hike",
    "activityName": "Sinhagad Fort Trek"
  },

  "constraints": {
    "maxDistanceKm": 8,
    "minRating": 4.0
  }
}

**Response Body**
{
  "sessionId": "TRIP_2025_001",
  "status": "success",

  "originalActivity": {
    "activityName": "Sinhagad Fort Trek",
    "activityType": "hike",
    "reasonReplaced": "high fatigue activity not suitable for tired mood"
  },

  "newActivity": {
    "id": 8,
    "name": "Tattva Spa Koregaon Park",
    "type": "spa",
    "duration": 90,
    "fatigueLevel": 1,
    "distanceKm": 5.7,
    "rating": 4.7,
    "score": 17.3
  },

  "updatedSlot": {
    "startTime": "10:00",
    "endTime": "11:30",
    "activityType": "spa"
  },

  "alternativesConsidered": [
    { "id": 6, "name": "Four Fountains Spa Aundh", "score": 16.1 },
    { "id": 9, "name": "Leisure Spa Viman Nagar", "score": 14.8 },
    { "id": 18, "name": "Joshi Miniature Museum", "score": 14.2 }
  ]
}


## Mood Types 
tired, bored, hungry, sick, energetic, relaxed, adventurous, romantic, cultural

## Replan Engine Input 

{
  "sessionId": "TRIP_2025_001",
  "timestamp": "2025-11-25T10:15:00Z",

  "moodStats": {
    "tired": number,
    "bored": number,
    "hungry": number,
    "sick": number,
    "energetic": number,
    "relaxed": number
  },

  "currentSlot": {
    "startTime": string,
    "endTime": string,
    "activityId": string,
    "activityType": string,
    "activityName": string
  },

  "constraints": {
    "maxDistanceKm": number,
    "minRating": number
  }
}


## Itinerary Structure (Full)

{
  "sessionId": "TRIP_2025_001",

  "currentMood": {
    "mood": MoodType,
    "updatedAt": string
  },

  "days": [
    {
      "date": string,
      "activities": Activity[]
    }
  ],

  "updatedAt": string
}


## Activity Object (Full Structure)

Activity {
  id: string,
  name: string,
  description: string,
  category: string,   // e.g. "food", "spa", "hike", "museum", "sightseeing"

  imageUrl: string,

  startTime: string,   // "HH:mm" or ISO
  endTime: string,

  location: {
    name: string,
    coordinates: {
      lat: number,
      lng: number
    }
  },

  cost?: number,
  rating?: number,
  travelTimeToNext?: number,
  notes?: string
}


## Error Responses
(To be filled later)

## Final Notes
(To be filled later)

