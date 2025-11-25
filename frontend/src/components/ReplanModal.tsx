import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReplanSuggestion } from '../types/api'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'

type ReplanModalProps = {
  isOpen: boolean
  suggestions?: ReplanSuggestion[]
  onClose: () => void
  onApply: (activityId: string, alternativeId: string, replaceIndex?: number) => void
  isProcessing?: boolean
}

export function ReplanModal({
  isOpen,
  suggestions,
  onClose,
  onApply,
  isProcessing,
}: ReplanModalProps) {
  const [replaceIndexByActivity, setReplaceIndexByActivity] = useState<
    Record<string, number | null>
  >({})

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="w-full max-w-3xl rounded-3xl border border-white/10 bg-surface-raised/80 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">
                  Suggested alternative
                </p>
                <h2 className="mt-2 font-display text-3xl text-white">Pivot options</h2>
              </div>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/70 hover:border-white/40"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            {!suggestions?.length ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-white/70">
                No alternative suggestions available yet. Try again soon.
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {suggestions.map((suggestion) => {
                  const activityId = suggestion.originalActivity.id
                  const selectedIndex = replaceIndexByActivity[activityId] ?? null

                  return (
                    <div
                      key={activityId}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                        Original
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-white">
                        <span className="font-semibold">
                          {suggestion.originalActivity.name}
                        </span>
                        {suggestion.originalActivity.location?.name && (
                          <span className="inline-flex items-center gap-1 text-sm text-white/70">
                            <MapPin className="h-3.5 w-3.5" />
                            {suggestion.originalActivity.location.name}
                          </span>
                        )}
                      </div>
                      {suggestion.reason && (
                        <p className="mt-1 text-sm text-white/60">{suggestion.reason}</p>
                      )}

                      {suggestion.originalActivity.items &&
                        suggestion.originalActivity.items.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70">
                            <span className="uppercase tracking-[0.2em] text-white/50">
                              Replace which item?
                            </span>
                            <select
                              className="min-w-[280px] rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                              value={
                                selectedIndex === null || selectedIndex === undefined
                                  ? '0'
                                  : String(selectedIndex)
                              }
                              onChange={(e) => {
                                const value = e.target.value
                                setReplaceIndexByActivity((prev) => ({
                                  ...prev,
                                  [activityId]: Number(value),
                                }))
                              }}
                            >
                              {suggestion.originalActivity.items.map((item, index) => (
                                <option key={item.id} value={index}>
                                  {`Replace item ${index + 1}: ${item.text}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {suggestion.suggestedAlternatives.map((alternative) => (
                          <div
                            key={alternative.id}
                            className="rounded-2xl border border-white/10 bg-black/30 p-4"
                          >
                            <div className="flex items-center gap-2 text-white">
                              <Sparkles className="h-4 w-4 text-brand" />
                              <p className="font-semibold">{alternative.name}</p>
                            </div>
                            {alternative.description && (
                              <p className="mt-2 text-sm text-white/60">
                                {alternative.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-4 text-xs uppercase tracking-wide text-white/50">
                              {alternative.category && <span>{alternative.category}</span>}
                              {alternative.startTime && (
                                <span>
                                  {new Date(alternative.startTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                            <button
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand-glow transition hover:bg-brand-hover disabled:opacity-60"
                              disabled={isProcessing}
                              onClick={() =>
                                onApply(
                                  activityId,
                                  alternative.id,
                                  selectedIndex === null || selectedIndex === undefined
                                    ? undefined
                                    : selectedIndex,
                                )
                              }
                            >
                              Apply change
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

