import { StaticPage } from '@/components/StaticPage'

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <h2 className="font-serif text-xl font-bold text-forest">Data we collect</h2>
      <p>We collect your wallet address, profile information you provide, purchase history, and basic usage data to operate the marketplace.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">How we use it</h2>
      <p>Your data powers account access, content delivery, creator payouts, and platform improvements. We do not sell personal data.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Wallet data</h2>
      <p>Blockchain transactions are public by design. Your wallet address and on-chain payments may be visible on Celo explorers.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Third parties</h2>
      <p>We use Supabase for data storage and infrastructure providers for hosting. These partners process data under our instructions.</p>

      <h2 className="mt-8 font-serif text-xl font-bold text-forest">Contact</h2>
      <p>Questions about privacy? Email hello@lugha-pro.vercel.app</p>
    </StaticPage>
  )
}
