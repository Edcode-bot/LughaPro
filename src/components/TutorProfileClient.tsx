"use client";

import { Languages, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { AvailabilityGrid } from "@/components/ui/AvailabilityGrid";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BookingPanel } from "@/components/ui/BookingPanel";
import { Card } from "@/components/ui/Card";
import { ExpandableAbout } from "@/components/ui/ExpandableAbout";
import { FadeIn } from "@/components/ui/FadeIn";
import { Footer } from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/NavBar";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewWithStudent, TutorWithProfile } from "@/types";

type ApiResponse<T> = { data: T | null; error: string | null };

export function TutorProfileClient({ id }: { id: string }) {
  const [tutor, setTutor] = useState<TutorWithProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/tutors/${id}`).then((response) => response.json() as Promise<ApiResponse<TutorWithProfile>>),
      fetch(`/api/reviews/tutor/${id}`).then((response) => response.json() as Promise<ApiResponse<ReviewWithStudent[]>>),
    ])
      .then(([tutorResult, reviewResult]) => {
        if (!active) return;
        if (tutorResult.error || !tutorResult.data) setError(tutorResult.error ?? "Tutor not found");
        else setTutor(tutorResult.data);
        setReviews(reviewResult.data ?? []);
      })
      .catch(() => active && setError("Unable to load tutor."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <main className="min-h-screen bg-off-white"><NavBar /><div className="mx-auto max-w-7xl px-5 py-12"><div className="h-96 animate-pulse rounded-3xl bg-cream" /></div></main>;
  if (error || !tutor) return <main className="min-h-screen bg-off-white"><NavBar /><p className="mx-auto max-w-3xl px-5 py-20 text-red-700">{error ?? "Tutor not found"}</p></main>;

  return (
    <main className="min-h-screen bg-off-white">
      <NavBar />
      <FadeIn><section className="bg-gradient-to-br from-forest to-jade px-5 py-14 text-cream lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center"><Avatar name={tutor.profile.full_name} src={tutor.profile.avatar_url ?? undefined} online={tutor.is_online} size="xl" /><div className="flex-1"><div className="flex flex-wrap items-center gap-3">{tutor.is_online ? <Badge tone="online">Online Now</Badge> : null}{Number(tutor.rating) >= 4.7 ? <Badge tone="cusd">Top Tutor</Badge> : null}</div><h1 className="mt-4 font-serif text-5xl font-black">{tutor.profile.full_name}</h1><div className="mt-4 flex flex-wrap gap-5 text-cream/80"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{tutor.location ?? "East Africa"}</span><span className="flex items-center gap-2"><Languages className="h-4 w-4" />{(tutor.languages ?? ["Kiswahili"]).join(", ")}</span></div><div className="mt-4"><StarRating rating={Number(tutor.rating ?? 0)} /></div><p className="mt-5 max-w-3xl leading-8 text-cream/82">{tutor.bio ?? tutor.specialty ?? "Premium Kiswahili tutor."}</p></div></div></section></FadeIn>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 pb-96 lg:grid-cols-[1fr_360px] lg:px-8 lg:pb-12"><div className="space-y-8"><Card><h2 className="font-serif text-3xl font-black text-forest">Availability this week</h2><p className="mt-2 text-forest/65">Select a time that works for your schedule.</p><div className="mt-6"><AvailabilityGrid /></div></Card><ExpandableAbout text={tutor.bio ?? "This tutor designs lessons around your goals with pronunciation coaching, vocabulary practice, dialogue drills, and post-lesson notes."} /><section><h2 className="font-serif text-3xl font-black text-forest">Student reviews</h2><div className="mt-6 grid gap-4">{reviews.map((review) => <Card key={review.id}><div className="flex items-center gap-3"><Avatar name={review.student.full_name} src={review.student.avatar_url ?? undefined} /><div><p className="font-bold text-forest">{review.student.full_name}</p><p className="text-sm text-forest/55">{new Date(review.created_at).toLocaleDateString()}</p></div></div><div className="mt-3"><StarRating rating={review.rating} /></div><p className="mt-4 text-forest/75">{review.comment}</p></Card>)}</div></section></div><BookingPanel hourlyRate={Number(tutor.hourly_rate)} tutorId={tutor.id} tutorWalletAddress={tutor.profile.wallet_address} tutorName={tutor.profile.full_name} /></section>
      <Footer />
    </main>
  );
}

