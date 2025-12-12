"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function ManageMembersPage() {
  const [members, setMembers] = useState<User[]>([]);
  const { token } = useAuth();
  const clubId = 1; // Placeholder

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/clubs/${clubId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMembers(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch members", error);
      }
    };

    if (token) {
      fetchMembers();
    }
  }, [token]);

  return (
    <div className="container mx-auto">
      <h1 className="my-8 text-4xl font-bold">Manage Members</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Name</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Email</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Roles</th>
              <th className="px-6 py-3 text-left text-gray-500 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 border-b">{member.name}</td>
                <td className="px-6 py-4 border-b">{member.email}</td>
                <td className="px-6 py-4 border-b">{member.roles.join(", ")}</td>
                <td className="px-6 py-4 border-b">
                  <Button className="mr-2">Edit Role</Button>
                  <Button variant="destructive">Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
