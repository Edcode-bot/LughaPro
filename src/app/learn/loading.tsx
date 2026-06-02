export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-off-white">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-10 w-64 rounded bg-forest/10" />
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-20 rounded-full bg-forest/10" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white shadow-sm">
              <div className="h-40 rounded-t-2xl bg-forest/10" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-forest/10" />
                <div className="h-4 w-1/2 rounded bg-forest/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
