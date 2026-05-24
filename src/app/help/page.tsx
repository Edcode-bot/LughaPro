'use client'

import { useState } from 'react'
import { StaticPage } from '@/components/StaticPage'

const faqs = [
  ['How do I pay with cUSD?', 'Connect your Celo wallet, ensure you have cUSD on Celo Mainnet, then purchase content directly. Payments are recorded on-chain and in your library instantly.'],
  ['What is MiniPay?', 'MiniPay is a Celo wallet built into Opera Mini. You can use it to hold cUSD and pay for LughaPro content with low fees.'],
  ['How do NFT certificates work?', 'When you complete eligible learning paths, LughaPro will mint a certificate NFT on Celo. Smart contracts are rolling out soon.'],
  ['Can I get a refund?', 'Digital content purchases are generally final. Contact support if you experience a technical issue and we will review your case.'],
  ['How do I become a creator?', 'Connect your wallet, choose "I want to Teach", complete onboarding, then publish books or posts from the Publish page.'],
  ['What languages are supported?', 'Kiswahili is our primary focus. Many creators also offer bilingual or English supplementary content.'],
  ['Is my wallet data safe?', 'We store your wallet address to identify your account. We never ask for your private keys — all signing happens in your wallet.'],
  ['How does the referral program work?', 'Share your referral link from the Wallet page. When friends join and transact, you earn cUSD rewards tracked on-chain.'],
  ['What is Celo blockchain?', 'Celo is a mobile-first blockchain optimized for stablecoins like cUSD, making it ideal for everyday payments in Africa.'],
  ['How do I contact support?', 'Email hello@lugha-pro.vercel.app and include your wallet address and a description of the issue.'],
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <StaticPage title="Help Center">
      <div className="space-y-3">
        {faqs.map(([question, answer], index) => (
          <div key={question} className="rounded-2xl bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpen(open === index ? null : index)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-bold text-forest"
            >
              {question}
              <span>{open === index ? '−' : '+'}</span>
            </button>
            {open === index ? <p className="border-t border-forest/10 px-5 pb-4 text-sm">{answer}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-cream p-6">
        <h2 className="font-serif text-xl font-bold text-forest">Still need help?</h2>
        <p className="mt-2 text-sm">Email us at hello@lugha-pro.vercel.app</p>
      </div>
    </StaticPage>
  )
}
