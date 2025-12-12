"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storage } from "@/lib/storage";

export default function CreateProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = storage.getToken();
      const response = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/club-admin/${params.clubId}/dashboard/projects`);
      } else {
        console.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={formData.description} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="date" value={formData.end_date} onChange={handleChange} required />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Project"}</Button>
        </div>
      </form>
    </div>
  );
}
