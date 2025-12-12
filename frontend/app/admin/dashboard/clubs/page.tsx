"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { Club } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function ManageClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/clubs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (error) {
        console.error("Failed to fetch clubs", error);
      }
    };

    if (token) {
      fetchClubs();
    }
  }, [token]);

  return (
    <div className="container mx-auto">
      <h1 className="my-8 text-4xl font-bold">Manage Clubs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Name</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Description</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club.id}>
                <td className="px-6 py-4 border-b">{club.name}</td>
                <td className="px-6 py-4 border-b">{club.description}</td>
                <td className="px-6 py-4 border-b">
                  <Button className="mr-2">Edit</Button>
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
