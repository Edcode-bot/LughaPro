import { Languages, MapPin } from "lucide-react";
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
import { reviews, tutors } from "@/lib/mock-data";

export default async function TutorProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tutor = tutors.find((item) => item.id === id) ?? tutors[0];

  return (
    <main className="min-h-screen bg-off-white">
      <NavBar />
      <FadeIn>
        <section className="bg-gradient-to-br from-forest to-jade px-5 py-14 text-cream lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center">
            <Avatar name={tutor.name} online={tutor.online} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">{tutor.online ? <Badge tone="online">Online Now</Badge> : null}{tutor.topTutor ? <Badge tone="cusd">Top Tutor</Badge> : null}</div>
              <h1 className="mt-4 font-serif text-5xl font-black">{tutor.name}</h1>
              <div className="mt-4 flex flex-wrap gap-5 text-cream/80"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{tutor.location}</span><span className="flex items-center gap-2"><Languages className="h-4 w-4" />{tutor.languages.join(", ")}</span></div>
              <div className="mt-4"><StarRating rating={tutor.rating} /></div>
              <p className="mt-5 max-w-3xl leading-8 text-cream/82">{tutor.bio}</p>
            </div>
          </div>
        </section>
      </FadeIn>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-8">
          <Card><h2 className="font-serif text-3xl font-black text-forest">Availability this week</h2><p className="mt-2 text-forest/65">Select a time that works for your schedule.</p><div className="mt-6"><AvailabilityGrid /></div></Card>
          <ExpandableAbout text="I design every lesson around your goals, whether you are preparing for travel, business, research, family conversations, or cultural immersion. Sessions include pronunciation coaching, vocabulary practice, short dialogue drills, and post-lesson notes so you can keep improving between bookings." />
          <section><h2 className="font-serif text-3xl font-black text-forest">Student reviews</h2><div className="mt-6 grid gap-4">{reviews.map((review) => <Card key={review.name}><div className="flex items-center gap-3"><Avatar name={review.name} /><div><p className="font-bold text-forest">{review.name}</p><p className="text-sm text-forest/55">{review.date}</p></div></div><div className="mt-3"><StarRating rating={review.rating} /></div><p className="mt-4 text-forest/75">{review.comment}</p></Card>)}</div></section>
        </div>
        <BookingPanel hourlyRate={tutor.price} />
      </section>
      <Footer />
    </main>
  );
}
