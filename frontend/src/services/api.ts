import axios, { AxiosError, AxiosHeaders } from 'axios'
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type {
  GetItineraryResponse,
  MoodType,
  ReplanResponse,
} from '../types/api'

const getBaseUrl = (customBaseUrl?: string) => {
  const baseUrl = customBaseUrl ?? import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    console.warn('API base URL missing: set VITE_API_BASE_URL in .env')
  }
  return baseUrl ?? ''
}

const attachToken = (config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config
  const stored = localStorage.getItem('travelItinerarySession')
  if (!stored) return config

  try {
    const parsed = JSON.parse(stored) as { token?: string }
    if (parsed?.token) {
      const headers = AxiosHeaders.from(config.headers ?? {})
      headers.set('Authorization', `Bearer ${parsed.token}`)
      config.headers = headers
    }
  } catch (err) {
    console.warn('Failed to parse travelItinerarySession from storage', err)
  }
  return config
}

const normalizeError = (error: AxiosError) => {
  const response = error.response
  if (!response) {
    return Promise.reject({
      status: 0,
      message: 'Network Error: backend unreachable or CORS blocked',
    })
  }

  return Promise.reject({
    status: response.status,
    message:
      (response.data as { message?: string })?.message ??
      error.message ??
      'Unexpected error',
    data: response.data,
  })
}

export const getApiClient = (customBaseUrl?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: getBaseUrl(customBaseUrl),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  client.interceptors.request.use(attachToken)
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => normalizeError(error),
  )

  return client
}

const api = getApiClient()

export const createSession = async (
  body?: { name?: string },
): Promise<{ sessionId: string }> => {
  const response = await api.post('/api/sessions/create', body ?? {})
  const data = response.data as { ok?: boolean; session?: { _id?: string } }
  return { sessionId: data.session?._id ?? '' }
}

export const updateMood = async (
  sessionId: string,
  mood: MoodType,
): Promise<{
  success: boolean
  currentMood: { mood: MoodType; updatedAt: string }
}> => {
  const response = await api.post('/api/mood/update', {
    sessionId,
    participantId: 'p1',
    mood,
  })
  const ok = (response.data as { ok?: boolean }).ok ?? true
  return {
    success: ok,
    currentMood: {
      mood,
      updatedAt: new Date().toISOString(),
    },
  }
}

export const getItinerary = async (
  sessionId: string,
): Promise<GetItineraryResponse> => {
  const response = await api.get(`/api/itinerary/${sessionId}`)
  const raw = response.data as {
    ok?: boolean
    itinerary?: Array<{
      id?: string
      _id?: string
      title?: string
      type?: string
      startTime?: string
      durationMinutes?: number
      location?: { name?: string; lat?: number; lng?: number }
    }>
    sessionId: string
  }

  const activities = (raw.itinerary ?? []).map((a) => ({
    id: a.id || (a._id ?? ''),
    name: a.title ?? 'Activity',
    category: a.type ?? 'general',
    startTime: a.startTime,
    endTime: undefined,
    durationMin: a.durationMinutes,
    location: a.location
      ? {
          name: a.location.name,
          coordinates:
            typeof a.location.lat === 'number' && typeof a.location.lng === 'number'
              ? { lat: a.location.lat, lng: a.location.lng }
              : undefined,
        }
      : undefined,
    description: undefined,
    imageUrl: undefined,
    rating: undefined,
    cost: undefined,
  }))

  const normalized: GetItineraryResponse = {
    sessionId: raw.sessionId,
    days: [
      {
        date: new Date().toISOString().slice(0, 10),
        activities,
      },
    ],
    updatedAt: new Date().toISOString(),
  }

  return normalized
}

export const replan = async (
  sessionId: string,
  activityId: string,
  selectedAlternativeId?: string,
): Promise<ReplanResponse> => {
  const response = await api.post('/api/replan/propose', {
    sessionId,
    affectedBlockId: activityId,
    selectedAlternativeId,
  })
  return response.data
}

