export default function TutorsLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-off-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-10 w-80 rounded bg-forest/10" />
        <div className="mt-6 h-14 max-w-2xl rounded-full bg-forest/10" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </div>
  )
}
