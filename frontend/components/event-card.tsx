"use client";

import { useState } from "react";
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { CCarousel, CCarouselItem, CImage } from "@coreui/react";
import Image from "next/image";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: any) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(event.likes ?? 0);

  const handleLike = async() => {
    try {
      // Send like request to the backend
      const response = await fetch(
        `http://localhost:8000/api/events/${event.id}/like`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        // Update local like state
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error("Error liking the event:", error);
    }
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow bg-card">
      {/* Header: avatar, club name, date */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
          <Image
            src={event.image ?? "/avatar-placeholder.png"}
            alt={event.club}
            width={36}
            height={36}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{event.club}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{event.date}</span>
          </div>
          <div className="text-xs text-muted-foreground">{event.location}</div>
        </div>
      </div>

      {/* Image / Media */}
      <div className="w-full relative">
        <div className="w-full h-64 bg-black/5 overflow-hidden">
          <CImage
            className="d-block w-100 h-64 object-cover"
            src={event.post_image ?? "/placeholder.jpg"}
            alt={event.post_title}
          />
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {event.event_type_name}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.post_description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* Engagement Row */}
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <div>{event.likes_count} likes</div>
          <div>{event.comments ?? 0} comments</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex-1 justify-center"
            onClick={handleLike}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "text-red-500" : ""}`} />
            <span className="ml-2" onClick={handleLike}>Like</span>
          </Button>

          <Button variant="ghost" className="flex-1 justify-center">
            <MessageCircle className="w-5 h-5" />
            <span className="ml-2">Comment</span>
          </Button>

          <Button variant="ghost" className="flex-1 justify-center">
            <Share2 className="w-5 h-5" />
            <span className="ml-2">participate</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
