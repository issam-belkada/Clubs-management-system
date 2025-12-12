"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storage } from "@/lib/storage";
import { Project } from "@/lib/types";

export default function CreateTaskPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    date: "", // Due Date
  });

  useEffect(() => {
    // Fetch projects to populate dropdown
    const fetchProjects = async () => {
        try {
            const token = storage.getToken();
            const response = await fetch("http://localhost:8000/api/projects", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(response.ok) {
                const data = await response.json();
                setProjects(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (e) {
            console.error("Failed to load projects", e);
        }
    }
    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.projectId) {
        alert("Please select a project");
        setLoading(false);
        return;
    }

    try {
      const token = storage.getToken();
      // Assuming endpoint is POST /api/projects/{id}/tasks
      const response = await fetch(`http://localhost:8000/api/projects/${formData.projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            title: formData.title,
            due_date: formData.date
        }),
      });

      if (response.ok) {
        router.push(`/club-admin/${params.clubId}/dashboard/projects`); // Or tasks list if exists
      } else {
        console.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="projectId">Project</Label>
          <select 
            id="projectId" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.projectId} 
            onChange={handleChange}
            required
          >
            <option value="">Select a project</option>
            {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="title">Task Title</Label>
          <Input id="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div>
            <Label htmlFor="date">Due Date</Label>
            <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Task"}</Button>
        </div>
      </form>
    </div>
  );
}
