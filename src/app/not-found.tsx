import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-off-white px-5 text-center text-forest">
      <div className="max-w-xl rounded-3xl bg-white p-8 shadow-sm">
        <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="mx-auto h-10 w-auto" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-gold">404</p>
        <h1 className="mt-4 font-serif text-5xl font-black">Ukurasa haukupatikana</h1>
        <p className="mt-3 text-xl font-bold text-jade">Ukurasa haukupatikana</p>
        <p className="mt-3 text-forest/65">This path wandered off the lesson map. Let&apos;s get you back to learning Kiswahili.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-black text-forest">Go Home</Link>
      </div>
    </main>
  )
}
