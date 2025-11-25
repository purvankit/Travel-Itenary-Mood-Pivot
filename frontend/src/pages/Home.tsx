import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCcw, SmilePlus, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <RefreshCcw className="h-4 w-4" />
            Live itinerary replanning
          </p>
          <div className="space-y-6">
            <h1 className="font-display text-4xl leading-tight text-white md:text-5xl">
              Keep the vibe high with itineraries that adapt in real time.
            </h1>
            <p className="text-lg text-white/70">
              Mood Pivot listens to your group&apos;s mood pulses and instantly
              proposes better activities, seamless swaps, and map-ready
              directions to keep every moment on point.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm text-white/70 md:flex-row">
            <div className="rounded-2xl border border-white/10 bg-surface-raised/40 p-4">
              <p className="text-4xl font-semibold text-white">2m</p>
              <p>Average time to replan after a mood change.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface-raised/40 p-4">
              <p className="text-4xl font-semibold text-white">92%</p>
              <p>Users reporting smoother group decisions.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-brand-glow transition hover:bg-brand-hover"
            >
              Create or join a trip
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Preview dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="rounded-3xl border border-white/5 bg-gradient-to-b from-surface to-surface-raised p-6 shadow-2xl"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">
              Live status
            </p>
            <h3 className="mt-3 font-display text-2xl text-white">
              NYC Mood Board
            </h3>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Energy', value: 'High', icon: SmilePlus },
                { label: 'Group size', value: '6 friends', icon: Users },
                { label: 'Next pivot in', value: '14 min', icon: RefreshCcw },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-white/10 p-2 text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </div>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-white/60">
              Dashboard mock panels update when moods change, hinting at the
              interactive experience you&apos;ll craft next.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

