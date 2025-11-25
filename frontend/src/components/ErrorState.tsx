type ErrorStateProps = {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center text-white">
      <p className="text-lg font-semibold">Something went wrong</p>
      <p className="mt-2 text-sm text-white/70">
        {message ?? 'Unable to load the latest itinerary.'}
      </p>
      {onRetry && (
        <button
          className="mt-4 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold hover:border-white/50"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  )
}

