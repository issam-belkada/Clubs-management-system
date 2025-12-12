"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface Club {
  id: string;
  name: string;
  description: string;
  followersCount: number;
  isFollowing: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

export default function ClubProfilePage() {
  const params = useParams();
  const clubId = params.id;

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubData() {
      try {
        const [clubRes, eventsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/clubs/${clubId}`),
          axios.get(`http://localhost:8000/api/clubs/${clubId}/events`),
        ]);
        setClub(clubRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchClubData();
  }, [clubId]);

  const handleFollow = async () => {
    if (!club) return;
    try {
      const res = await axios.post(`/api/clubs/${clubId}/follow`);
      setClub({ ...club, isFollowing: res.data.isFollowing });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!club) return <p>Club not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Club Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{club.name}</h1>
        <button
          className={`px-4 py-2 rounded ${
            club.isFollowing ? "bg-gray-300" : "bg-blue-600 text-white"
          }`}
          onClick={handleFollow}
        >
          {club.isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      <p className="mb-4">{club.description}</p>
      <p className="text-sm text-gray-500 mb-6">
        Followers: {club.followersCount}
      </p>

      {/* Club Events */}
      <h2 className="text-2xl font-semibold mb-4">Events</h2>
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="border p-4 rounded">
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.date}</p>
              <p>{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
