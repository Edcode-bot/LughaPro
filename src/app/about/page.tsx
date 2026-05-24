import { StaticPage } from '@/components/StaticPage'

export default function AboutPage() {
  return (
    <StaticPage title="Born in East Africa, Built for Africa">
      <p>
        LughaPro is a Kiswahili content marketplace connecting African learners with verified creators.
        We believe language education should be accessible, culturally grounded, and fairly paid.
      </p>

      <h2 id="mission" className="mt-10 font-serif text-2xl font-bold text-forest">
        Mission
      </h2>
      <p>Making Kiswahili education accessible and affordable across Africa.</p>

      <h2 className="mt-10 font-serif text-2xl font-bold text-forest">Our values</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Accessibility', 'Pay per content with crypto or card — no expensive subscriptions required.'],
          ['Cultural Pride', 'Content rooted in East African contexts, dialects, and lived experience.'],
          ['Web3 Innovation', 'Wallet-native accounts, transparent payments, and NFT certificates on Celo.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-bold text-forest">{title}</h3>
            <p className="mt-2 text-sm">{text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-serif text-2xl font-bold text-forest">Team</h2>
      <p>We&apos;re building in public — follow our journey as we ship creator tools and on-chain certificates.</p>
    </StaticPage>
  )
}
