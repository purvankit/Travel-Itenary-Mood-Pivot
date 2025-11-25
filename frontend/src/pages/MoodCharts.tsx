import { useEffect, useState } from 'react'

 type MoodLogPoint = {
  _id: string
  mood: string
  timestamp: string
}

export default function MoodChartsPage() {
  const [logs, setLogs] = useState<MoodLogPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true)
        const res = await fetch('/api/mood/logs')
        if (!res.ok) throw new Error('Failed to load mood logs')
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const points = logs
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((log, index) => ({
      x: index,
      y: moodToY(log.mood),
      label: log.mood,
      time: new Date(log.timestamp).toLocaleString(),
    }))

  const moodCountsEntries = logs.reduce<Map<string, number>>((map, log) => {
    const current = map.get(log.mood) ?? 0
    map.set(log.mood, current + 1)
    return map
  }, new Map())

  const moodCounts = Array.from(moodCountsEntries.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  const maxCount = moodCounts.length > 0 ? Math.max(...moodCounts.map((m) => m.count)) : 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Mood charts</h1>
        <p className="mt-2 text-sm text-white/70">
          A simple view of how moods have changed over time across all sessions.
        </p>
      </div>

      {loading && <p className="text-sm text-white/60">Loading mood logs...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <p className="text-sm text-white/60">
          No moods have been logged yet. Start a session and log some moods to see them here.
        </p>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="mb-4 text-sm font-semibold text-white/80">Mood frequency</p>

          <div className="relative w-full rounded-2xl bg-black/40 px-6 py-24">
            <div className="flex items-end justify-between gap-6">
              {moodCounts.map((mood) => {
                const heightPercent = maxCount > 0 ? (mood.count / maxCount) * 100 : 0
                return (
                  <div key={mood.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end justify-center">
                      <div
                        className="w-6 rounded-full bg-teal-300/80"
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      />
                    </div>
                    <div className="flex flex-col items-center text-xs text-white/80">
                      <span className="font-semibold">{mood.count}</span>
                      <span className="mt-0.5 text-[11px] capitalize">{mood.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4">
            <p className="mb-2 text-sm font-semibold text-white/80">Logs</p>
            <div className="space-y-1 text-xs text-white/70">
              {points.slice(-5).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <span className="truncate">{p.time}</span>
                  <span className="font-mono text-white">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function moodToY(mood: string): number {
  // Map moods to vertical positions (lower = calmer, higher = more intense)
  switch (mood) {
    case 'tired':
    case 'sick':
      return 80
    case 'relaxed':
    case 'romantic':
      return 60
    case 'cultural':
      return 50
    case 'adventurous':
      return 35
    case 'energetic':
      return 20
    default:
      return 50
  }
}
