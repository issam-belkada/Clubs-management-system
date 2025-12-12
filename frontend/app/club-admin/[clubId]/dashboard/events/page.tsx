"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const { token } = useAuth();
  const params = useParams();
  const clubId = params.clubId; // Placeholder

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/clubs/${clubId}/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };

    if (token) {
      fetchEvents();
    }
  }, [token]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center my-8">
        <h1 className="text-4xl font-bold">Manage Events</h1>
        <Link href={`/club-admin/${params.clubId}/dashboard/events/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Title</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Description</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Date</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 border-b">{event.title}</td>
                <td className="px-6 py-4 border-b">{event.description}</td>
                <td className="px-6 py-4 border-b">{event.date}</td>
                <td className="px-6 py-4 border-b">
                  <Button className="mr-2">Edit</Button>
                  <Link href={`/club-admin/${params.clubId}/dashboard/events/${event.id}/posts`}>
                    <Button variant="secondary" className="mr-2">Manage Posts</Button>
                  </Link>
                  <Button variant="destructive">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
