import { motion } from 'framer-motion'
import type { Activity } from '../types/api'
import { Clock3, Sparkles } from 'lucide-react'

type ItineraryListProps = {
  activities: Activity[]
  onSuggestAlternative: (activityId: string) => void
  tripDateRange?: string
  tripGroupSize?: string
  onEditItems?: (activityId: string, items: string[]) => void
}

export function ItineraryList({
  activities,
  onSuggestAlternative,
  tripDateRange,
  tripGroupSize,
  onEditItems,
}: ItineraryListProps) {
  if (!activities.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/60">
        No activities planned for this day. Add one or request a replan.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl text-white">{activity.name}</h3>
            </div>
            <div className="flex gap-2">
              {onEditItems && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  onClick={() =>
                    onEditItems(
                      activity.id,
                      activity.items?.map((i) => i.text) ?? [],
                    )
                  }
                >
                  Edit items
                </button>
              )}
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                onClick={() => onSuggestAlternative(activity.id)}
              >
                <Sparkles className="h-4 w-4 text-brand" />
                Suggest alternative
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
            {tripDateRange && (
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {tripDateRange}
              </span>
            )}
            {tripGroupSize && (
              <span className="inline-flex items-center gap-2">
                👥 {tripGroupSize} people
              </span>
            )}
            {typeof activity.rating === 'number' && (
              <span className="inline-flex items-center gap-2">
                ⭐ {activity.rating.toFixed(1)}
              </span>
            )}
            {typeof activity.cost === 'number' && (
              <span className="inline-flex items-center gap-2">
                💸 ${activity.cost.toFixed(0)}
              </span>
            )}
          </div>
          {activity.items && activity.items.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
              {activity.items.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          )}
          {activity.description && (
            <p className="mt-3 text-sm text-white/60">{activity.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

