"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/MyContext";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { token } = useAuth();
  const params = useParams();
  const clubId = params.clubId ; // Placeholder

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/clubs/${clubId}/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center my-8">
        <h1 className="text-4xl font-bold">Manage Projects</h1>
        <Button onClick={() => window.location.href = `/club-admin/${params.clubId}/dashboard/projects/new`}>
          Add Project
        </Button>
      </div>
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
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-6 py-4 border-b">{project.name}</td>
                <td className="px-6 py-4 border-b">{project.description}</td>
                <td className="px-6 py-4 border-b">
                  <Button 
                    className="mr-2" 
                    variant="outline"
                    onClick={() => window.location.href = `/club-admin/${params.clubId}/dashboard/projects/${project.id}`}
                  >
                    Tasks
                  </Button>
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
