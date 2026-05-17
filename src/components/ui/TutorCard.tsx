import { MapPin } from "lucide-react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { StarRating } from "./StarRating";

export type Tutor = {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  languages: string[];
  payments: Array<"cUSD" | "CELO" | "Fiat">;
  online: boolean;
  bio: string;
  image?: string;
  topTutor?: boolean;
};

type TutorCardProps = {
  tutor: Tutor;
};

export function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={tutor.name} src={tutor.image} online={tutor.online} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-forest">{tutor.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-forest/65">
              <MapPin className="h-4 w-4" />
              {tutor.location}
            </div>
          </div>
        </div>
        {tutor.online ? <Badge tone="online">Online</Badge> : null}
      </div>
      <StarRating rating={tutor.rating} />
      <p className="line-clamp-3 text-sm leading-6 text-forest/70">{tutor.bio}</p>
      <div className="flex flex-wrap gap-2">
        {tutor.languages.map((language) => (
          <Badge key={language}>{language}</Badge>
        ))}
        {tutor.topTutor ? <Badge tone="top">Top Tutor</Badge> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {tutor.payments.map((payment) => (
          <Badge key={payment} tone={payment === "cUSD" ? "cusd" : payment === "CELO" ? "celo" : "new"}>
            {payment}
          </Badge>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-forest/10 pt-5">
        <div>
          <span className="text-2xl font-black text-forest">${tutor.price}</span>
          <span className="text-sm text-forest/60">/hr</span>
        </div>
        <Button>Book Now</Button>
      </div>
    </Card>
  );
}
