import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getItinerary,
  replan,
  updateMood,
} from '../services/api'
import type {
  GetItineraryResponse,
  MoodType,
  ReplanResponse,
} from '../types/api'

const itineraryKey = (sessionId?: string) => ['itinerary', sessionId]

export function useItinerary(sessionId?: string) {
  return useQuery({
    queryKey: itineraryKey(sessionId),
    queryFn: () => {
      if (!sessionId) {
        return Promise.reject(new Error('Missing sessionId'))
      }
      return getItinerary(sessionId)
    },
    enabled: Boolean(sessionId),
    retry: 2,
    staleTime: 5000,
    refetchInterval: 5000,
  })
}

export function useUpdateMood(sessionId?: string) {
  const queryClient = useQueryClient()
  return useMutation<
    Awaited<ReturnType<typeof updateMood>>,
    { message?: string },
    MoodType,
    { previous?: GetItineraryResponse }
  >({
    mutationFn: (mood: MoodType) => {
      if (!sessionId) {
        return Promise.reject(new Error('Missing sessionId'))
      }
      return updateMood(sessionId, mood)
    },
    onMutate: async (mood) => {
      if (!sessionId) return { previous: undefined }
      await queryClient.cancelQueries({ queryKey: itineraryKey(sessionId) })
      const previous = queryClient.getQueryData<GetItineraryResponse>(
        itineraryKey(sessionId),
      )

      const optimistic = previous
        ? {
            ...previous,
            currentMood: {
              mood,
              updatedAt: new Date().toISOString(),
            },
          }
        : undefined

      if (optimistic) {
        queryClient.setQueryData(itineraryKey(sessionId), optimistic)
      }

      return { previous }
    },
    onSuccess: (data, mood) => {
      if (!sessionId) return
      queryClient.setQueryData<GetItineraryResponse | undefined>(
        itineraryKey(sessionId),
        (current) => {
          if (!current) return current
          const nextMood: { mood: MoodType; updatedAt: string } =
            data.currentMood ?? {
              mood,
              updatedAt: new Date().toISOString(),
            }
          return {
            ...current,
            currentMood: nextMood,
          }
        },
      )
    },
    onError: (_error, _mood, context) => {
      if (!sessionId) return
      if (context?.previous) {
        queryClient.setQueryData(
          itineraryKey(sessionId),
          context.previous,
        )
      }
    },
    onSettled: () => {
      if (!sessionId) return
      queryClient.invalidateQueries({ queryKey: itineraryKey(sessionId) })
    },
  })
}

export function useReplan(sessionId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      activityId,
      selectedAlternativeId,
    }: {
      activityId: string
      selectedAlternativeId?: string
    }): Promise<ReplanResponse> => {
      if (!sessionId) {
        return Promise.reject(new Error('Missing sessionId'))
      }
      return replan(sessionId, activityId, selectedAlternativeId)
    },
    onSuccess: (data) => {
      if (!sessionId) return
      queryClient.setQueryData(
        itineraryKey(sessionId),
        data.updatedItinerary,
      )
    },
  })
}

