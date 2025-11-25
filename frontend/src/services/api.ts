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
  const response = await api.post('/createSession', body ?? {})
  return response.data
}

export const updateMood = async (
  sessionId: string,
  mood: MoodType,
): Promise<{
  success: boolean
  currentMood: { mood: MoodType; updatedAt: string }
}> => {
  const response = await api.post('/updateMood', { sessionId, mood })
  return response.data
}

export const getItinerary = async (
  sessionId: string,
): Promise<GetItineraryResponse> => {
  const response = await api.get('/getItinerary', {
    params: { sessionId },
  })
  return response.data
}

export const replan = async (
  sessionId: string,
  activityId: string,
  selectedAlternativeId?: string,
): Promise<ReplanResponse> => {
  const response = await api.post('/replan', {
    sessionId,
    activityId,
    selectedAlternativeId,
  })
  return response.data
}

