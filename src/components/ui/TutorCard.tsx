import { MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { StarRating } from "./StarRating";

export type Tutor = {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  languages: string[];
  payments: Array<"cUSD" | "CELO" | "Card" | "Fiat">;
  online: boolean;
  bio: string;
  image?: string;
  topTutor?: boolean;
};

type TutorCardProps = {
  tutor: Tutor;
  href?: string;
};

function normalizePayment(payment: Tutor["payments"][number]) {
  if (payment === "Fiat") return "Card";
  return payment;
}

export function TutorCard({ tutor, href }: TutorCardProps) {
  const payments = [...new Set(tutor.payments.map(normalizePayment))];

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col items-center text-center">
        <Avatar name={tutor.name} src={tutor.image} online={tutor.online} size="lg" />
        <h3 className="mt-4 font-serif text-xl font-bold text-forest">{tutor.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-foreground/60">
          <MapPin className="h-3.5 w-3.5" />
          {tutor.location}
        </p>
        <div className="mt-2">
          <StarRating rating={tutor.rating} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {tutor.languages.map((language) => (
          <span
            key={language}
            className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-white"
          >
            {language}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {payments.map((payment) => (
          <span
            key={payment}
            className="rounded-full bg-off-white px-2.5 py-1 text-xs font-semibold text-forest ring-1 ring-forest/10"
          >
            {payment}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <p className="text-center">
          <span className="text-3xl font-black text-gold">${tutor.price}</span>
          <span className="text-sm text-foreground/60">/hr</span>
        </p>
        <Link
          href={href ?? `/tutor/${tutor.id}`}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-bold text-foreground transition hover:bg-[#e6ac00]"
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}
