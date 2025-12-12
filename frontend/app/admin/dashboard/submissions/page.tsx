"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { Button } from "@/components/ui/button";

interface ClubSubmission {
  id: number;
  club_name: string;
  user_name: string;
}

interface EventSubmission {
  id: number;
  event_title: string;
  user_name: string;
}

export default function ManageSubmissionsPage() {
  const [clubSubmissions, setClubSubmissions] = useState<ClubSubmission[]>([]);
  const [eventSubmissions, setEventSubmissions] = useState<EventSubmission[]>(
    []
  );
  const { token } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const [clubRes, eventRes] = await Promise.all([
          fetch("http://localhost:8000/api/submissions/clubs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/submissions/events", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (clubRes.ok) {
          const data = await clubRes.json();
          setClubSubmissions(data);
        }
        if (eventRes.ok) {
          const data = await eventRes.json();
          setEventSubmissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      }
    };

    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  return (
    <div className="container mx-auto">
      <h1 className="my-8 text-4xl font-bold">Manage Submissions</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Club Submissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-gray-500 border-b">
                    Club Name
                  </th>
                  <th className="px-6 py-3 text-left text-gray-500 border-b">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-gray-500 border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 border-b">
                      {submission.club_name}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {submission.user_name}
                    </td>
                    <td className="px-6 py-4 border-b">
                      <Button className="mr-2">Approve</Button>
                      <Button variant="destructive">Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">Event Submissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-gray-500 border-b">
                    Event Title
                  </th>
                  <th className="px-6 py-3 text-left text-gray-500 border-b">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-gray-500 border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 border-b">
                      {submission.event_title}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {submission.user_name}
                    </td>
                    <td className="px-6 py-4 border-b">
                      <Button className="mr-2">Approve</Button>
                      <Button variant="destructive">Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
