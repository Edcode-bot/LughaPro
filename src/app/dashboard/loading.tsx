export default function DashboardLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-off-white p-6">
      <div className="h-8 w-48 rounded bg-forest/10" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  )
}
