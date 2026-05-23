import Link from "next/link";
import { countryFlag, initials } from "@/lib/content";
import { TutorWithProfile } from "@/types";
import { StarRating } from "./StarRating";

type CreatorCardProps = {
  tutor: TutorWithProfile;
  horizontal?: boolean;
};

export function CreatorCard({ tutor, horizontal = false }: CreatorCardProps) {
  const name = tutor.profile?.full_name ?? "Creator"
  const country = tutor.profile?.country ?? tutor.location ?? "East Africa"
  const specialties: string[] = Array.isArray(tutor.specialty)
    ? tutor.specialty
    : typeof tutor.specialty === "string" && tutor.specialty
      ? [tutor.specialty]
      : []
  const contentCount = (tutor.book_count ?? 0) + (tutor.post_count ?? 0)
  const topCreator = Number(tutor.rating) >= 4.8

  if (horizontal) {
    return (
      <Link
        href={`/tutor/${tutor.id}`}
        className="flex min-w-[280px] shrink-0 items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div className="relative">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-forest text-lg font-bold text-white">
            {initials(name)}
          </div>
          {tutor.is_online ? <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-gold" /> : null}
        </div>
        <div>
          <p className="font-serif font-bold text-forest">{name}</p>
          <p className="text-sm text-foreground/60">{countryFlag(country)} {country}</p>
          <div className="mt-1">
            <StarRating rating={Number(tutor.rating ?? 0)} size={14} />
          </div>
          <p className="mt-1 text-xs text-foreground/55">{contentCount} items</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/tutor/${tutor.id}`}
      className="block rounded-2xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative mx-auto w-fit">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-forest text-2xl font-bold text-white">
          {initials(name)}
        </div>
        {tutor.is_online ? <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-gold" /> : null}
      </div>
      <h3 className="mt-4 font-serif text-lg font-bold text-forest">{name}</h3>
      <p className="text-sm text-foreground/60">{specialties[0] ?? "Kiswahili Creator"}</p>
      <div className="mt-2 flex justify-center">
        <StarRating rating={Number(tutor.rating ?? 0)} size={14} />
      </div>
      <p className="mt-2 text-xs text-foreground/55">{contentCount} content items</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {tutor.is_verified ? <span className="rounded-full bg-jade/15 px-2 py-1 text-[10px] font-bold text-jade">✓ Verified</span> : null}
        {topCreator ? <span className="rounded-full bg-gold/20 px-2 py-1 text-[10px] font-bold text-forest">★ Top Creator</span> : null}
      </div>
    </Link>
  )
}
