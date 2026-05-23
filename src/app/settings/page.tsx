import { Copy } from 'lucide-react'
import { WalletWidget } from '@/components/WalletWidget'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-off-white px-5 py-10 text-forest">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-serif text-5xl font-black">Settings</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl bg-forest p-4 text-cream">
            <nav className="grid gap-2">{['Profile', 'Security', 'Notifications', 'Wallet'].map((item) => <a key={item} href={`#${item.toLowerCase()}`} className="rounded-2xl px-4 py-3 font-bold hover:bg-white/10">{item}</a>)}</nav>
          </aside>
          <section className="grid gap-6">
            <section id="profile"><Card><h2 className="font-serif text-3xl font-black">Profile</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><input className="rounded-2xl border p-4" placeholder="Full name" /><input className="rounded-2xl border p-4" placeholder="Country" /><input className="rounded-2xl border p-4" placeholder="Languages" /><input className="rounded-2xl border p-4" placeholder="Hourly rate" /></div><textarea className="mt-4 min-h-28 w-full rounded-2xl border p-4" placeholder="Bio" /><Button className="mt-4">Save profile</Button></Card></section>
            <section id="security"><Card><h2 className="font-serif text-3xl font-black">Security</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><input className="rounded-2xl border p-4" placeholder="Current password" /><input className="rounded-2xl border p-4" placeholder="New password" /><input className="rounded-2xl border p-4" placeholder="Confirm password" /></div><Button className="mt-4" variant="secondary">Disconnect Wallet</Button></Card></section>
            <section id="notifications"><Card><h2 className="font-serif text-3xl font-black">Notifications</h2>{['Booking reminders', 'Payment confirmations', 'New messages', 'Referral rewards', 'Platform updates'].map((item) => <label key={item} className="mt-4 flex items-center justify-between rounded-2xl bg-cream p-4 font-bold"><span>{item}</span><input type="checkbox" defaultChecked /></label>)}<Button className="mt-4">Save preferences</Button></Card></section>
            <section id="wallet"><Card><h2 className="font-serif text-3xl font-black">Wallet</h2><div className="mt-5"><WalletWidget /></div><div className="mt-5 rounded-2xl bg-cream p-4"><p className="font-bold">Your Referral Link</p><p className="mt-2 break-all text-sm text-forest/65">https://lughapro.com/?ref=YOURCODE</p><Button className="mt-3" size="sm"><Copy className="h-4 w-4" />Copy</Button></div></Card></section>
          </section>
        </div>
      </div>
    </main>
  )
}
