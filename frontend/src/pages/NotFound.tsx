import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-white/50">
        404
      </p>
      <h1 className="font-display text-4xl text-white">Lost your pivot?</h1>
      <p className="text-white/60">
        The screen you&apos;re looking for doesn&apos;t exist. Jump back to the
        dashboard or home to keep planning.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
        >
          Return home
        </Link>
        <Link
          to="/dashboard"
          className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-brand-glow transition hover:bg-brand-hover"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  )
}

