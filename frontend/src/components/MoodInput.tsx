import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { useUpdateMood } from '../hooks/useItinerary'
import type { MoodType } from '../types/api'
import { useItinerary } from '../hooks/useItinerary'

const moodOptions: { label: string; value: MoodType; emoji: string; blurb: string }[] = [
  { label: 'Relaxed', value: 'relaxed', emoji: '🌤', blurb: 'Keep it low-key' },
  { label: 'Energetic', value: 'energetic', emoji: '⚡', blurb: 'Ready to move' },
  { label: 'Adventurous', value: 'adventurous', emoji: '🧗', blurb: 'Try something bold' },
  { label: 'Romantic', value: 'romantic', emoji: '💘', blurb: 'Soft & intimate' },
  { label: 'Cultural', value: 'cultural', emoji: '🖼', blurb: 'Museums, galleries' },
  { label: 'Tired', value: 'tired', emoji: '😴', blurb: 'Need a slow pace' },
]

type MoodInputProps = {
  sessionId?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MoodInput({ sessionId, isOpen, onOpenChange }: MoodInputProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const actualOpen = isOpen ?? internalOpen
  const itinerary = useItinerary(sessionId)
  const updateMood = useUpdateMood(sessionId)

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open)
    if (isOpen === undefined) {
      setInternalOpen(open)
    }
  }

  const currentMood = itinerary.data?.currentMood?.mood

  return (
    <>
          <AnimatePresence>
        {actualOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-surface-raised/80 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">
                    Mood pulse
                  </p>
                  <h2 className="mt-2 font-display text-3xl">How&apos;s the vibe?</h2>
                  <p className="text-white/60">
                    Selecting a mood will ping the dashboard and replan suggestions in real-time.
                  </p>
                </div>
                <button
                  className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70 hover:border-white/40"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {moodOptions.map((mood) => {
                  const isLoading = updateMood.isPending && updateMood.variables === mood.value
                  const isActive = currentMood === mood.value
                  return (
                    <button
                      key={mood.value}
                      onClick={() => {
                        if (!sessionId) {
                          toast.error('Create or join a session first.')
                          return
                        }
                        updateMood.mutate(mood.value, {
                          onSuccess: () => {
                            toast.success(`Mood updated to ${mood.label}`)
                            handleOpenChange(false)
                          },
                          onError: (error: { message?: string }) => {
                            toast.error(error?.message ?? 'Failed to update mood')
                          },
                        })
                      }}
                      className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                        isActive
                          ? 'border-brand bg-brand/20 shadow-brand-glow'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                      disabled={updateMood.isPending}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <div>
                        <p className="text-lg font-semibold text-white">{mood.label}</p>
                        <p className="text-sm text-white/60">{mood.blurb}</p>
                      </div>
                      {isLoading && (
                        <motion.span
                          className="ml-auto text-sm text-brand"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          Updating…
                        </motion.span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}