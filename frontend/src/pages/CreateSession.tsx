import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Sparkles, Users } from 'lucide-react'
import { createSession } from '../services/api'
import { persistSession } from '../utils/session'

export default function CreateSessionPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [tripName, setTripName] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [attendeeName, setAttendeeName] = useState('')

  const createSessionMutation = useMutation({
    mutationFn: () =>
      createSession({
        name: tripName || undefined,
      }),
  })

  const persistAndNavigate = (sessionId: string, notice?: string) => {
    persistSession({
      sessionId,
      id: sessionId,
      name: tripName || attendeeName || undefined,
      dateRange: dateRange || undefined,
      groupSize: groupSize || undefined,
    })
    if (notice) {
      toast((t) => (
        <span className="text-sm">
          {notice}
          <button
            className="ml-3 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-white/70"
            onClick={() => toast.dismiss(t.id)}
          >
            Dismiss
          </button>
        </span>
      ))
    }
    navigate(`/dashboard?sessionId=${sessionId}`)
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const result = await createSessionMutation.mutateAsync()
      persistAndNavigate(result.sessionId)
      toast.success('Session created. Redirecting to dashboard.')
    } catch (error) {
      const message =
        (error as { message?: string })?.message ?? 'Unable to reach the itinerary service.'
      toast.error(message)

      if (import.meta.env.DEV) {
        const fallbackId = 'local-dev-session'
        persistAndNavigate(fallbackId, 'Backend unreachable. Using local dev session.')
        toast.success('Using local dev session to continue the flow.')
      }
    }
  }

  const handleJoin = (event: React.FormEvent) => {
    event.preventDefault()
    if (!inviteCode.trim()) {
      toast.error('Enter an invite code to continue.')
      return
    }
    persistAndNavigate(inviteCode.trim())
    toast.success('Session linked. Opening dashboard.')
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">
          Sessions
        </p>
        <h1 className="font-display text-4xl text-white">
          Create a planning room or join an existing trip.
        </h1>
        <p className="text-white/70">
          Every session keeps mood history, itinerary versions, and real-time map context in sync for
          the whole group.
        </p>
      </div>

      <div className="mx-auto max-w-4xl rounded-3xl border border-white/5 bg-surface-raised/60 p-8">
        <div className="mb-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          {[
            { label: 'Create', value: 'create' },
            { label: 'Join', value: 'join' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setMode(tab.value as typeof mode)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                mode === tab.value
                  ? 'bg-brand text-white shadow-brand-glow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label} session
            </button>
          ))}
        </div>

        <form
          className="space-y-6"
          onSubmit={mode === 'create' ? handleCreate : handleJoin}
        >
          {mode === 'create' ? (
            <Fragment>
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Trip name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  placeholder="e.g. Austin Food Crawl"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Date range</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  placeholder="Apr 26 – Apr 29"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Group size</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  placeholder="6"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                />
              </label>
              <button
                className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-brand-glow transition hover:bg-brand-hover disabled:opacity-60"
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? 'Creating…' : 'Create live itinerary'}
              </button>
            </Fragment>
          ) : (
            <Fragment>
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Invite code</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  placeholder="e.g. MOOD-7XYZ"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Your name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  placeholder="Avery"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                />
              </label>
              <button className="w-full rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/20">
                Join session
              </button>
            </Fragment>
          )}
        </form>

        <div className="mt-8 grid gap-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/70 sm:grid-cols-2">
          {[
            { label: 'Live collaborators', value: '5 active', icon: Users },
            { label: 'Suggested pivots queued', value: '3', icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="rounded-2xl bg-white/10 p-3 text-brand">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
                <p className="text-base font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

