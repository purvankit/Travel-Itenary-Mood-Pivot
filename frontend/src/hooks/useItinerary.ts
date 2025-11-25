import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getItinerary, updateMood, fetchReplan } from '../services/api'
import type {
  GetItineraryResponse,
  MoodType,
  ReplanResponse,
} from '../types/api'

const itineraryKey = (sessionId?: string) => ['itinerary', sessionId]

// ------------------------------------------------------
// GET ITINERARY HOOK
// ------------------------------------------------------
export function useItinerary(sessionId?: string) {
  return useQuery({
    queryKey: itineraryKey(sessionId),
    queryFn: () => {
      if (!sessionId) return Promise.reject(new Error('Missing sessionId'))
      return getItinerary(sessionId)
    },
    enabled: !!sessionId,
    refetchInterval: 4000,
  })
}

// ------------------------------------------------------
// UPDATE MOOD HOOK (TRIGGER REPLAN AUTOMATICALLY)
// ------------------------------------------------------
export function useUpdateMood(sessionId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mood: MoodType) => {
      if (!sessionId) throw new Error('Missing sessionId')
      return updateMood(sessionId, mood)
    },

    onSuccess: async (_resp, _mood) => {
      if (!sessionId) return

      // FORCE re-fetch of itinerary
      await queryClient.invalidateQueries({ queryKey: itineraryKey(sessionId) })

      // 🔥 TRIGGER REPLAN AFTER MOOD CHANGE
      await queryClient.prefetchQuery({
        queryKey: ['replan', sessionId],
        queryFn: () => fetchReplan(sessionId),
      })
    },
  })
}

// ------------------------------------------------------
// REQUEST REPLAN HOOK
// (When user presses some explicit "replan" control)
// ------------------------------------------------------
export function useReplan(sessionId?: string) {
  return useMutation<ReplanResponse>({
    mutationFn: () => {
      if (!sessionId) throw new Error('Missing sessionId')
      return fetchReplan(sessionId)
    },
  })
}

