import { StaticPage } from '@/components/StaticPage'

export default function GuidelinesPage() {
  return (
    <StaticPage title="Creator Guidelines">
      <h2 className="font-serif text-xl font-bold text-forest">Quality standards</h2>
      <p>Publish accurate, well-structured Kiswahili content with clear learning outcomes. Use proper grammar and respectful cultural representation.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Allowed content</h2>
      <p>Educational books, lessons, articles, and study materials related to Kiswahili and African languages.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Not allowed</h2>
      <p>Hate speech, plagiarism, misleading claims, adult content, or materials that infringe copyright.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Verification</h2>
      <p>Top creators with consistent quality and positive learner feedback earn the Verified Creator badge.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Revenue share</h2>
      <p>Creators receive 70% of each sale. LughaPro retains 30% to maintain the platform and payment infrastructure.</p>
    </StaticPage>
  )
}
