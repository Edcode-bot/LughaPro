import { TutorProfileClient } from '@/components/TutorProfileClient'

export default async function TutorProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TutorProfileClient id={id} />
}

