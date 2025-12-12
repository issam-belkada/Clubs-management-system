"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/event-card";
import { mockEvents } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { set } from "date-fns";

interface RecommendedEventsProps {
  userPreferences: string[];
  onUpdatePreferences: (preferences: string[]) => void;
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
];

export function RecommendedEvents({
  userPreferences,
  onUpdatePreferences,
}: RecommendedEventsProps) {
  const [recommendedEvents, setRecommendedEvents] = useState<typeof mockEvents>(
    []
  );

  const [allevents, setAllEvents] = useState<typeof mockEvents>([]);
  // Filter events based on user preferences
  useEffect(() => {
    async function fetchRecommendedEvents() {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()!.split(";").shift();
        };

        const token = getCookie("token");
        const res = await axios.get(
          "http://localhost:8000/api/event-posts/trending",
          {
            headers: {
              "Content-Type": "application/json",
              bearer: token || "",
            },
          }
        );

        // your API returns data inside res.data.data
        console.log("Fetched recommended events:");
        setRecommendedEvents(res.data.data.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    // run whenever preferences change
    fetchRecommendedEvents();
  }, []);

  const togglePreference = (category: string) => {
    if (userPreferences.includes(category)) {
      onUpdatePreferences(userPreferences.filter((pref) => pref !== category));
    } else {
      onUpdatePreferences([...userPreferences, category]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preference Selection */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">Your Interests</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={
                userPreferences.includes(category) ? "default" : "outline"
              }
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
            <p className="text-muted-foreground">
              Select interests to see recommended events
            </p>
          </div>
        ) : (
          recommendedEvents.map((event, idx) => (
            <EventCard key={idx} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
