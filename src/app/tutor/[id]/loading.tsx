import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

export default function TutorLoading() {
  return <main className="min-h-screen bg-off-white px-5 py-10"><div className="mx-auto max-w-7xl"><SkeletonText className="h-12 w-2/3" /><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]"><SkeletonCard /><SkeletonCard /></div></div></main>
}
