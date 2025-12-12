"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { EventCard } from "@/components/event-card";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface EventFeedProps {
  searchQuery?: string;
  selectedCategory?: string | null;
  endpoint?: string;
}

export function EventFeed({ searchQuery, selectedCategory, endpoint = "event-posts/" }: EventFeedProps) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Ensure endpoint handles trailing slash if needed, but here simple concatenation usually works if strict
        const url = `http://localhost:8000/api/${endpoint}`;
        const res = await axios.get(url);
        console.log("Fetched feed:", res.data);
        if (res.data.status === "success" || Array.isArray(res.data.data)) {
             setEvents(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching event posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto pb-20">
      {/* Create Post input placeholder - optional for typical social feed */}
      {/* 
      <div className="bg-card rounded-lg p-4 mb-6 shadow-sm border border-border">
         <input type="text" placeholder="What's on your mind?" className="w-full bg-muted/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20" />
      </div> 
      */}

      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}

      {loading && (
        <div className="flex justify-center py-8">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && events.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
              No posts found.
          </div>
      )}
    </div>
  );
}
