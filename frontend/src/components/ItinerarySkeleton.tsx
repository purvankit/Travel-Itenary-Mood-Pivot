export function ItinerarySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-3xl border border-white/5 bg-white/5 p-5"
        >
          <div className="h-6 w-1/3 rounded bg-white/10"></div>
          <div className="mt-4 flex gap-4">
            <div className="h-4 w-24 rounded bg-white/10"></div>
            <div className="h-4 w-32 rounded bg-white/10"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

