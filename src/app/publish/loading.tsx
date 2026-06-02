export default function PublishLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-off-white p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-10 w-56 rounded bg-forest/10" />
        <div className="h-12 rounded-full bg-forest/10" />
        <div className="h-96 rounded-2xl bg-white" />
      </div>
    </div>
  )
}
