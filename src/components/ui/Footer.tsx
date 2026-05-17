import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="font-serif text-3xl font-black">
            Lugha<span className="text-gold">Pro</span>
          </Link>
          <p className="mt-4 max-w-sm text-cream/75">Connecting Africa through language and Web3</p>
        </div>
        <div>
          <h3 className="font-bold text-gold">Marketplace</h3>
          <div className="mt-4 grid gap-3 text-sm text-cream/75">
            <a href="#tutors">Find Tutors</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gold">Company</h3>
          <div className="mt-4 grid gap-3 text-sm text-cream/75">
            <a href="#">For Tutors</a>
            <a href="#">Community</a>
            <a href="#">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
