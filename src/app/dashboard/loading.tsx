import { SkeletonStat } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return <main className="min-h-screen bg-off-white px-5 py-8"><div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <SkeletonStat key={index} />)}</div></main>
}
