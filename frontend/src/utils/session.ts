export type StoredSession = {
  sessionId: string
  id?: string
  token?: string
  name?: string
}

const STORAGE_KEY = 'travelItinerarySession'

export const SESSION_EVENT = 'travel-session-updated'

export const getStoredSession = (): StoredSession | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to parse stored session', error)
    return null
  }
}

export const persistSession = (session: StoredSession) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export const clearSession = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(SESSION_EVENT))
}

export const SESSION_STORAGE_KEY = STORAGE_KEY

