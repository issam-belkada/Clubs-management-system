"use client"

import { useState } from "react"
import { Heart, MapPin, Calendar, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/types"
import { CCarousel, CCarouselItem, CImage } from '@coreui/react'
import Image from "next/image"


interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(event.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image */}
     
  

      <div className="relative w-full  bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
      
       <CCarousel controls>
    <CCarouselItem>
      <CImage className="d-block w-100 h-100" src="/placeholder.jpg" alt="slide 1" />
    </CCarouselItem>
    <CCarouselItem>
      <CImage className="d-block w-100 h-100" src="/placeholder.jpg" alt="slide 2" />
    </CCarouselItem>
    <CCarouselItem>
      <CImage className="d-block w-100 h-100" src="/placeholder.jpg" alt="slide 3" />
    </CCarouselItem>
  </CCarousel>
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {event.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Club Name */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="font-medium">{event.club}</span>
        </div>

        {/* Event Title */}
        <h3 className="text-lg font-bold line-clamp-2 hover:underline cursor-pointer">{event.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {event.date} at {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground py-2 border-t border-border">
          <span>{likeCount} likes</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={handleLike}>
            <Heart
              className="w-4 h-4"
              fill={isLiked ? "currentColor" : "none"}
              color={isLiked ? "#ef4444" : "currentColor"}
            />
            <span className="hidden sm:inline">Like</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
