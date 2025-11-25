export type MoodType =
  | 'relaxed'
  | 'energetic'
  | 'adventurous'
  | 'romantic'
  | 'cultural'
  | 'tired'

export interface Coordinates {
  lat: number
  lng: number
}

export interface ActivityLocation {
  name?: string
  coordinates?: Coordinates
}

export interface Activity {
  id: string
  name: string
  description?: string
  category: string
  imageUrl?: string
  startTime?: string
  endTime?: string
  location?: ActivityLocation
  durationMin?: number
  rating?: number
  cost?: number
}

export interface Day {
  date: string
  activities: Activity[]
}

export interface GetItineraryResponse {
  sessionId: string
  currentMood?: { mood: MoodType; updatedAt: string }
  days: Day[]
  updatedAt: string
}

export interface ReplanSuggestion {
  originalActivity: Activity
  suggestedAlternatives: Activity[]
  reason?: string
}

export interface ReplanResponse {
  success: boolean
  updatedItinerary: GetItineraryResponse
  suggestions?: ReplanSuggestion[]
}

