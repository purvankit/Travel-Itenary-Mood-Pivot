import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { useReplan } from '../hooks/useItinerary'
import { getItinerary } from '../services/api'
import { getStoredSession, persistSession, SESSION_EVENT } from '../utils/session'
import { ItineraryList } from '../components/ItineraryList'
import { ItinerarySkeleton } from '../components/ItinerarySkeleton'
import { ErrorState } from '../components/ErrorState'
import { ReplanModal } from '../components/ReplanModal'
import type { ReplanSuggestion } from '../types/api'

export default function DashboardPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [replanSuggestions, setReplanSuggestions] = useState<
    ReplanSuggestion[] | undefined
  >(undefined)
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false)
  const storedSession = getStoredSession()
  const tripDateRange = storedSession?.dateRange
  const tripGroupSize = storedSession?.groupSize

  useEffect(() => {
    const urlSessionId = searchParams.get('sessionId') ?? undefined
    if (urlSessionId) {
      // Preserve any existing stored session metadata (name, dateRange, groupSize)
      const existing = getStoredSession()
      persistSession({
        sessionId: urlSessionId,
        id: urlSessionId,
        name: existing?.name,
        dateRange: existing?.dateRange,
        groupSize: existing?.groupSize,
      })
      setSessionId(urlSessionId)
      return
    }
    const stored = getStoredSession()
    const storedId = stored?.id ?? stored?.sessionId
    setSessionId(storedId ?? '')
  }, [searchParams])

  useEffect(() => {
    const handler = () => {
      const stored = getStoredSession()
      const storedId = stored?.id ?? stored?.sessionId ?? ''
      setSessionId(storedId)
    }
    window.addEventListener('storage', handler)
    window.addEventListener(SESSION_EVENT, handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener(SESSION_EVENT, handler)
    }
  }, [])

  useEffect(() => {
    if (sessionId === '') {
      navigate('/create', { replace: true })
    }
  }, [sessionId, navigate])

  const itineraryQuery = useQuery({
    queryKey: ['itinerary', sessionId],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('Missing sessionId')
      }
      return getItinerary(sessionId)
    },
    enabled: Boolean(sessionId),
    retry: 1,
  })

  const replanMutation = useReplan(sessionId ?? undefined)

  useEffect(() => {
    if (itineraryQuery.data?.days?.length) {
      setSelectedDayIndex((prev) =>
        prev >= itineraryQuery.data!.days.length ? 0 : prev,
      )
    }
  }, [itineraryQuery.data?.days])

  const selectedDay = useMemo(() => {
    if (!itineraryQuery.data?.days?.length) return undefined
    return itineraryQuery.data.days[selectedDayIndex] ?? itineraryQuery.data.days[0]
  }, [itineraryQuery.data?.days, selectedDayIndex])

  const activities = selectedDay?.activities ?? []

  const handleSuggestAlternative = (activityId: string) => {
    replanMutation.mutate(
      { activityId },
      {
        onSuccess: (response) => {
          if (response.suggestions?.length) {
            setReplanSuggestions(response.suggestions)
            setIsReplanModalOpen(true)
          } else {
            toast.success('Itinerary updated based on mood shift.')
          }
        },
        onError: (error: { message?: string }) => {
          toast.error(error?.message ?? 'Unable to replan right now.')
        },
      },
    )
  }

  const handleApplyAlternative = (activityId: string, altId: string) => {
    replanMutation.mutate(
      { activityId, selectedAlternativeId: altId },
      {
        onSuccess: () => {
          toast.success('Itinerary updated.')
          setIsReplanModalOpen(false)
        },
        onError: (error: { message?: string }) => {
          toast.error(error?.message ?? 'Failed to apply change.')
        },
      },
    )
  }

  if (sessionId === null) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-white">Loading session…</h1>
      </div>
    )
  }

  if (sessionId === '') {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-white">Redirecting…</h1>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">
            Live itinerary
          </p>
          <h1 className="font-display text-4xl text-white">Pivot control center</h1>
          <p className="text-white/60">
            Watch the itinerary, map, and suggestions react as moods change.
          </p>
        </div>
        {itineraryQuery.data?.currentMood && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Current mood
            </p>
            <p className="mt-1 text-lg font-semibold">
              {itineraryQuery.data.currentMood.mood}
            </p>
            <p className="text-xs text-white/60">
              Updated {new Date(itineraryQuery.data.currentMood.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {itineraryQuery.isError && (
        <ErrorState
          message={(itineraryQuery.error as { message?: string })?.message}
          onRetry={() => itineraryQuery.refetch()}
        />
      )}

      {itineraryQuery.isLoading && <ItinerarySkeleton />}

      {!itineraryQuery.isLoading && !itineraryQuery.isError && (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3">
            {itineraryQuery.data?.days?.map((day, index) => (
              <button
                key={day.date}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  index === selectedDayIndex
                    ? 'border-brand bg-brand/20 text-white shadow-brand-glow'
                    : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                }`}
                onClick={() => setSelectedDayIndex(index)}
              >
                {new Date(day.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </button>
            ))}
          </div>

          <div className="grid gap-8">
            <ItineraryList
              activities={activities}
              onSuggestAlternative={handleSuggestAlternative}
              tripDateRange={tripDateRange}
              tripGroupSize={tripGroupSize}
            />
          </div>
        </div>
      )}

      <ReplanModal
        isOpen={isReplanModalOpen}
        suggestions={replanSuggestions}
        onClose={() => setIsReplanModalOpen(false)}
        onApply={handleApplyAlternative}
        isProcessing={replanMutation.isPending}
      />
    </div>
  )
}

