import Link from 'next/link'
import { NavBar } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'

export const metadata = {
  title: 'Creator Academy — LughaPro',
  description: 'A four-module program for African creators. Package your knowledge, write content that sells, and earn in cUSD directly to your wallet.',
}

export default function AcademyPage() {
  return (
    <>
      <NavBar />
      <main className="pt-16">

        {/* Hero */}
        <section className="bg-[#171717] py-20 text-center relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#FFBF00]/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 mx-auto max-w-3xl px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFBF00]/30 bg-[#FFBF00]/10 px-4 py-1.5 mb-6">
              <span className="text-[#FFBF00] text-sm font-semibold">Creator Academy</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black text-white leading-tight">
              Package &amp; Monetize<br />Your Knowledge
            </h1>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Turn what only you can teach into content that sells — and keeps selling. A four-module program for African creators.
            </p>
            <p className="mt-2 text-base text-white/40 max-w-xl mx-auto">
              You bring the culture. LughaPro brings the buyers and pays you 85%, directly, in cUSD.
            </p>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              {[
                { n: '1', t: 'Package & Monetize Your Knowledge', href: '#m1' },
                { n: '2', t: 'Writing Titles & Covers That Convert', href: '#m2' },
                { n: '3', t: 'Building a Series for Recurring Income', href: '#m3' },
                { n: '4', t: 'Going Live: Earning as a Creator', href: '#m4' },
              ].map(m => (
                <a key={m.n} href={m.href}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:border-[#FFBF00]/40 hover:bg-white/10 transition-all">
                  <div className="font-serif text-3xl font-black text-[#FFBF00]">{m.n}</div>
                  <div className="text-white/80 text-sm font-semibold mt-2 leading-snug">{m.t}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 space-y-20">

          {/* MODULE 1 */}
          <section id="m1">
            <div className="border-t-2 border-[#171717] pt-5 mb-8">
              <p className="text-xs font-black tracking-widest uppercase text-[#FFBF00]">Module 1</p>
              <h2 className="font-serif text-4xl font-black text-[#171717] mt-1">Package &amp; Monetize Your Knowledge</h2>
            </div>

            <div className="rounded-2xl bg-[#1a4731]/10 border-l-4 border-[#1a4731] p-5 mb-6">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Outcome</p>
              <p className="text-[#171717]">By the end of this module you can name your sellable knowledge, choose the buyer it serves, and structure it so the valuable part is what people pay for.</p>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">1.1 The mindset shift: from knowledge to product</h3>
            <p className="text-gray-700 leading-relaxed">Most experts under-earn for one reason: they give knowledge away in conversations and casual lessons but never <strong>package</strong> it. Packaging is the difference between knowing something and selling it.</p>
            <p className="text-gray-700 leading-relaxed mt-3">Your unfair advantage on LughaPro is <strong>authenticity</strong>. You are the native speaker, the real artisan, the actual storyteller. Competitors can copy a format; they cannot copy your heritage.</p>

            <div className="rounded-2xl bg-[#fdf6e3] border-l-4 border-[#FFBF00] p-5 my-5">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">The big idea</p>
              <p className="text-[#171717]">You are not selling information — information is free online. You are selling <strong>a result, packaged with trust</strong>. That authenticity cannot be googled, so price it like the asset it is.</p>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-4">1.2 Find your sellable knowledge</h3>
            <h4 className="font-bold text-[#171717] mt-5 mb-2">Step 1 — Map your expertise</h4>
            <p className="text-gray-700">Write down everything you could teach for ten minutes with no preparation. Your strongest products come from this list.</p>
            <h4 className="font-bold text-[#171717] mt-5 mb-2">Step 2 — Know who pays, and why</h4>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
                <thead>
                  <tr>
                    <th className="bg-[#1a4731] text-white text-left p-3">Buyer</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">What they want</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">What they pay for</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['Learners', 'A real, usable skill', 'Structured lessons, practice, credentials'],
                    ['Diaspora', 'To reconnect with heritage', 'Language, proverbs, music, stories of home'],
                    ['Travellers', 'To navigate and connect', 'Safari phrases, etiquette, cultural prep'],
                    ['Enterprises', 'Training and compliance', 'Bulk language training, verified credentials'],
                  ] as const).map(([a, b, c], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f8f4ef]' : 'bg-white'}>
                      <td className="p-3 border-b border-gray-100 font-semibold">{a}</td>
                      <td className="p-3 border-b border-gray-100">{b}</td>
                      <td className="p-3 border-b border-gray-100">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl bg-[#fdf6e3] border-l-4 border-[#FFBF00] p-5 my-5">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Action</p>
              <p className="text-[#171717]">Pick the <strong>one</strong> buyer your first product serves best. Trying to serve everyone produces content that converts no one.</p>
            </div>

            <h4 className="font-bold text-[#171717] mt-5 mb-2">Step 3 — Validate before you build</h4>
            <ul className="space-y-2 text-gray-700">
              {[
                'Has anyone ever asked you this in real life? Then demand exists.',
                'Is it specific enough to promise a clear result? "Greet elders correctly in Luganda" beats "Learn Luganda."',
                'Can you make it authentic in a way others cannot? That is your edge.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#FFBF00] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-4">1.3 Packaging: turn knowledge into a product</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
                <thead>
                  <tr>
                    <th className="bg-[#1a4731] text-white text-left p-3">Your knowledge</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">Best format</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['A language or dialect', 'Lesson (text + audio), live tutor sessions'],
                    ['Music, instruments, song', 'Audio / music content, video performance'],
                    ['A craft, textile, art', "Marketplace listing + a \"how it's made\" video"],
                    ['Stories, history, proverbs', 'Written content, audio folktales'],
                    ['A full skill', 'A series — recurring income (Module 3)'],
                  ] as const).map(([a, b], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f8f4ef]' : 'bg-white'}>
                      <td className="p-3 border-b border-gray-100 font-semibold">{a}</td>
                      <td className="p-3 border-b border-gray-100">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-4">1.4 The money model: teach value, gate the payoff</h3>
            <p className="text-gray-700">This is the single most important packaging skill on LughaPro.</p>
            <ul className="space-y-2 text-gray-700 mt-3">
              <li className="flex gap-3">
                <span className="h-2 w-2 rounded-full bg-[#FFBF00] flex-shrink-0 mt-2" />
                <span><strong>Free preview</strong> — give away genuinely useful content; enough to prove you&apos;re the real thing and build trust.</span>
              </li>
              <li className="flex gap-3">
                <span className="h-2 w-2 rounded-full bg-[#FFBF00] flex-shrink-0 mt-2" />
                <span><strong>Paid section</strong> — lock the payoff: the part that took real expertise.</span>
              </li>
            </ul>
            <div className="rounded-2xl bg-[#1a4731]/10 border-l-4 border-[#1a4731] p-5 my-5">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Worked example — the &quot;Kiboko&quot; lesson</p>
              <p className="text-[#171717]"><strong>Free:</strong> hippo vocabulary + a famous proverb. <strong>Paid:</strong> the hidden second meaning of the word <em>kiboko</em> — that it also means &quot;whip,&quot; from hippo-hide — plus safari phrases and practice answers. Always gate the insider insight.</p>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-4">1.5 Build a value ladder</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
                <thead>
                  <tr>
                    <th className="bg-[#1a4731] text-white text-left p-3">Step</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">What it is</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">Why it earns</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['Free', 'Preview content', 'Builds trust and audience'],
                    ['Low price', 'A single lesson, track, or story', 'An easy first "yes"'],
                    ['Bundle', 'A series or pack', 'Higher value in one purchase'],
                    ['Premium', 'Live tutor session or 1:1', 'Your highest rate'],
                    ['Credential', 'On-chain proof of completion', 'Sells the outcome itself'],
                  ] as const).map(([a, b, c], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f8f4ef]' : 'bg-white'}>
                      <td className="p-3 border-b border-gray-100 font-semibold">{a}</td>
                      <td className="p-3 border-b border-gray-100">{b}</td>
                      <td className="p-3 border-b border-gray-100">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* MODULE 2 */}
          <section id="m2">
            <div className="border-t-2 border-[#171717] pt-5 mb-8">
              <p className="text-xs font-black tracking-widest uppercase text-[#FFBF00]">Module 2</p>
              <h2 className="font-serif text-4xl font-black text-[#171717] mt-1">Writing Titles &amp; Covers That Convert</h2>
            </div>
            <div className="rounded-2xl bg-[#1a4731]/10 border-l-4 border-[#1a4731] p-5 mb-6">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Outcome</p>
              <p>By the end of this module you can write a title that makes the right buyer click, and produce a cover that signals authenticity and quality at a glance.</p>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">2.1 Why titles matter more than content quality</h3>
            <p className="text-gray-700">A weak title on great content earns almost nothing. A strong title on decent content earns consistently. The title is the only part of your product a buyer sees before deciding to click — write it last, after you know exactly what the payoff is.</p>
            <h4 className="font-bold text-[#171717] mt-6 mb-2">The four-part title formula</h4>
            <div className="rounded-2xl bg-[#fdf6e3] border-l-4 border-[#FFBF00] p-5 my-4">
              <p className="font-mono text-sm text-[#171717]"><strong>[Result]</strong> + <strong>[Specificity]</strong> + <strong>[Buyer signal]</strong> + <strong>[Intrigue hook]</strong></p>
              <p className="mt-3 text-sm text-gray-600">Example: <strong>&quot;Greet Elders Correctly in Luganda — The 7 Phrases Diaspora Families Never Teach You&quot;</strong></p>
            </div>
            <h4 className="font-bold text-[#171717] mt-6 mb-2">Title patterns that work on LughaPro</h4>
            <ul className="space-y-2 text-gray-700">
              {[
                '"The X [your thing] Only Insiders Know"',
                'How to [result] Without [common barrier]',
                '[Number] [specific things] Every [buyer] Needs to Know',
                '"Why [common belief] Is Wrong — And What Elders Actually Teach"',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#FFBF00] flex-shrink-0 mt-2" />
                  <span className="font-mono text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">2.2 Cover images that sell</h3>
            <p className="text-gray-700">Your own photos beat stock every time on LughaPro. Authenticity is the product. A photo of your actual hands, your actual craft, your actual family recipe — that signals something a buyer cannot get anywhere else.</p>
            <ul className="space-y-2 text-gray-700 mt-3">
              {[
                'Use natural light. Africa has extraordinary light — use it.',
                'Show the thing, not just a symbol of the thing. Hands weaving, not a generic loom.',
                'Add a short text overlay (3–5 words) that restates the title hook.',
                'Avoid heavy filters. Authentic texture converts better than polished stock aesthetics.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#FFBF00] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* MODULE 3 */}
          <section id="m3">
            <div className="border-t-2 border-[#171717] pt-5 mb-8">
              <p className="text-xs font-black tracking-widest uppercase text-[#FFBF00]">Module 3</p>
              <h2 className="font-serif text-4xl font-black text-[#171717] mt-1">Building a Series for Recurring Income</h2>
            </div>
            <div className="rounded-2xl bg-[#1a4731]/10 border-l-4 border-[#1a4731] p-5 mb-6">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Outcome</p>
              <p>By the end of this module you have a series plan — a sequence of content pieces that creates recurring purchases from the same buyer.</p>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">3.1 Why a series outearns individual posts</h3>
            <p className="text-gray-700">A single post earns once. A series earns per episode — from the same buyer who already trusts you. The best creators on content platforms all publish series, not one-offs. Structure is what converts a first purchase into a fifth.</p>
            <h4 className="font-bold text-[#171717] mt-6 mb-2">The open-loop engine</h4>
            <p className="text-gray-700">End every episode by opening a loop you close in the next. A proverb whose second layer you reveal next time. A technique whose variation comes in the following post. Buyers who feel a loop open will pay to close it.</p>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">3.2 Series structures that work for cultural content</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
                <thead>
                  <tr>
                    <th className="bg-[#1a4731] text-white text-left p-3">Structure</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">Best for</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['Seasonal vault', 'Music, folktales, oral history', '12 folktales — one per month, each opening the next'],
                    ['Skill ladder', 'Language, craft technique', 'Beginner → Intermediate → Advanced lessons'],
                    ['Regional tour', 'Food, textiles, dialect', '10 dishes across 10 regions, each with a story'],
                    ['Story arc', 'History, biography', 'A historical figure told in 5 episodes'],
                  ] as const).map(([a, b, c], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f8f4ef]' : 'bg-white'}>
                      <td className="p-3 border-b border-gray-100 font-semibold">{a}</td>
                      <td className="p-3 border-b border-gray-100">{b}</td>
                      <td className="p-3 border-b border-gray-100 italic text-gray-600">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl bg-[#fdf6e3] border-l-4 border-[#FFBF00] p-5 my-5">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Rule</p>
              <p>Plan 5 episodes before publishing episode 1. You do not need to write them all — just know where the series goes. Buyers sense a plan. It is the difference between a creator and a publisher.</p>
            </div>
          </section>

          {/* MODULE 4 */}
          <section id="m4">
            <div className="border-t-2 border-[#171717] pt-5 mb-8">
              <p className="text-xs font-black tracking-widest uppercase text-[#FFBF00]">Module 4</p>
              <h2 className="font-serif text-4xl font-black text-[#171717] mt-1">Going Live: Earning as a Creator</h2>
            </div>
            <div className="rounded-2xl bg-[#1a4731]/10 border-l-4 border-[#1a4731] p-5 mb-6">
              <p className="text-xs font-black tracking-widest uppercase text-[#1a4731] mb-1">Outcome</p>
              <p>By the end of this module your first piece of content is live on LughaPro, priced correctly, and linked from at least one place where your intended buyer will see it.</p>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">4.1 The pre-publish checklist</h3>
            <ul className="space-y-2 text-gray-700">
              {[
                'Title passes the four-part formula test',
                'Cover image is your own photo, natural light, short text overlay',
                'Free preview is substantive — it proves your expertise, not just introduces it',
                'Paid section contains the insider payoff — the thing only you can give',
                'Price reflects the value ladder: low enough to be an easy yes, high enough to signal quality',
                'Tags are specific: "Swahili proverbs" beats "Africa"',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#1a4731] font-black">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">4.2 Pricing on LughaPro</h3>
            <p className="text-gray-700">Prices are set in USD (paid in cUSD, CELO, or USDT). You keep 85%. The platform takes 15% to cover operations, hosting, and contract gas fees.</p>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
                <thead>
                  <tr>
                    <th className="bg-[#1a4731] text-white text-left p-3">Content type</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">Suggested price range</th>
                    <th className="bg-[#1a4731] text-white text-left p-3">You receive</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['Single post / article', '$0.25 – $2.00', '$0.21 – $1.70'],
                    ['Music track', '$0.50 – $3.00', '$0.43 – $2.55'],
                    ['Short video', '$0.50 – $5.00', '$0.43 – $4.25'],
                    ['E-book / guide', '$2.00 – $15.00', '$1.70 – $12.75'],
                    ['Series (5+ pieces)', '$5.00 – $30.00', '$4.25 – $25.50'],
                  ] as const).map(([a, b, c], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f8f4ef]' : 'bg-white'}>
                      <td className="p-3 border-b border-gray-100 font-semibold">{a}</td>
                      <td className="p-3 border-b border-gray-100">{b}</td>
                      <td className="p-3 border-b border-gray-100 font-semibold text-[#1a4731]">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1a4731] mt-8 mb-2">4.3 Getting your first sale</h3>
            <p className="text-gray-700">Your first sale will come from people who already know you — your network, not strangers. Share the direct link to your content with a one-sentence explanation of who it helps and how.</p>
            <ul className="space-y-2 text-gray-700 mt-3">
              {[
                'Share in WhatsApp groups relevant to your topic',
                'Post your content link on X/Twitter with a short thread explaining the insider angle',
                'Share in diaspora communities where your heritage is represented',
                'Ask one person who already trusts you to buy first and share their reaction',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#FFBF00] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* CTA footer */}
        <section className="bg-[#1a4731] py-20 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-serif text-4xl font-black text-white">Ready to publish?</h2>
            <p className="mt-4 text-white/60 text-lg max-w-lg mx-auto">Your knowledge is the asset. LughaPro is the marketplace. Start publishing in under 10 minutes.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/publish"
                className="rounded-full bg-[#FFBF00] px-8 py-4 font-black text-[#171717] hover:bg-[#e6ac00] transition-all">
                Start Publishing →
              </Link>
              <Link href="/explore"
                className="rounded-full border border-white/30 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-all">
                Explore the Marketplace
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
