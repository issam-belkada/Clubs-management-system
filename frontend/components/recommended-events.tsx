"use client"

import { useState, useEffect } from "react"
import { EventCard } from "@/components/event-card"
import { mockEvents } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface RecommendedEventsProps {
  userPreferences: string[]
  onUpdatePreferences: (preferences: string[]) => void
}

const CATEGORIES = [
  "Technology",
  "Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Robotics",
  "AI & Machine Learning",
]

export function RecommendedEvents({ userPreferences, onUpdatePreferences }: RecommendedEventsProps) {
  const [recommendedEvents, setRecommendedEvents] = useState<typeof mockEvents>([])

  // Filter events based on user preferences
  useEffect(() => {
    const filtered = mockEvents.filter((event) => userPreferences.some((pref) => pref === event.category))

    // Sort by date and limit to top recommendations
    const sorted = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10)

    setRecommendedEvents(sorted)
  }, [userPreferences])

  const togglePreference = (category: string) => {
    if (userPreferences.includes(category)) {
      onUpdatePreferences(userPreferences.filter((pref) => pref !== category))
    } else {
      onUpdatePreferences([...userPreferences, category])
    }
  }

  return (
    <div className="space-y-6">
      {/* Preference Selection */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">Your Interests</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={userPreferences.includes(category) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </Card>

      {/* Recommended Events */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Events for You</h3>
        {recommendedEvents.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Select interests to see recommended events</p>
          </div>
        ) : (
          recommendedEvents.map((event, idx) => <EventCard key={idx} event={event} />)
        )}
      </div>
    </div>
  )
}
