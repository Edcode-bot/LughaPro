import { StaticPage } from '@/components/StaticPage'

const roles = [
  { title: 'Frontend Developer', summary: 'Build beautiful, accessible edtech experiences with Next.js and Web3.' },
  { title: 'Content Partnerships', summary: 'Grow our creator network across East Africa.' },
  { title: 'Community Manager', summary: 'Support learners and creators in our growing Kiswahili community.' },
]

export default function CareersPage() {
  return (
    <StaticPage title="Join the LughaPro team">
      <p>We&apos;re hiring passionate people who believe in African edtech.</p>
      <div className="mt-8 grid gap-4">
        {roles.map((role) => (
          <div key={role.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-forest">{role.title}</h2>
            <p className="mt-2 text-sm">{role.summary}</p>
            <a href="mailto:hello@lugha-pro.vercel.app" className="mt-4 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-bold text-foreground">
              Apply
            </a>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}
