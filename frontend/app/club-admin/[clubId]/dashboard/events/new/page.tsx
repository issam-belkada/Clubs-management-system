"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this component
import { storage } from "@/lib/storage";
import { FormBuilder, FormField } from "@/components/form-builder";

export default function CreateEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type_id: 4, // Default or select
    max_participants: 100,
    club_id: params.clubId, // hardcoded per user request/example, real app would get from context
    created_by: 1, // hardcoded per user request/example
    event_image: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = storage.getToken();
      
      // Format dates to YYYY-MM-DD HH:mm:ss
      // Input datetime-local gives YYYY-MM-DDTHH:mm
      const formatDate = (dateString: string) => {
          if(!dateString) return "";
          return dateString.replace("T", " ") + ":00";
      };

      const payload = {
          ...formData,
          club_id: parseInt(params.clubId as string) || formData.club_id,
          start_time: formatDate(formData.start_time),
          end_time: formatDate(formData.end_time),
          custom_form: customFields.length > 0 ? JSON.stringify(customFields) : null,
      };

      const response = await fetch("http://localhost:8000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/club-admin/${params.clubId}/dashboard/events`);
      } else {
        console.error("Failed to create event");
        const err = await response.text();
        console.error(err);
      }
    } catch (error) {
      console.error("Error creating event", error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { id: 1, name: 'Workshop' },
    { id: 2, name: 'Seminar' },
    { id: 3, name: 'Social' },
    { id: 4, name: 'Fundraiser' },
    { id: 5, name: 'Competition' },
    { id: 6, name: 'Networking' },
    { id: 7, name: 'Webinar' },
    { id: 8, name: 'Conference' },
    { id: 9, name: 'Meetup' },
    { id: 10, name: 'Hackathon' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input id="title" value={formData.title} onChange={handleChange} required />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={formData.description} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input id="start_time" type="datetime-local" value={formData.start_time} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input id="end_time" type="datetime-local" value={formData.end_time} onChange={handleChange} required />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={formData.location} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
            <Label htmlFor="event_type_id">Event Type</Label>
            <select
                id="event_type_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.event_type_id}
                onChange={(e) => setFormData({ ...formData, event_type_id: parseInt(e.target.value) })}
                required
            >
                {eventTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                        {type.name}
                    </option>
                ))}
            </select>
            </div>
            <div>
            <Label htmlFor="max_participants">Max Participants</Label>
            <Input id="max_participants" type="number" value={formData.max_participants} onChange={handleChange} required />
            </div>
        </div>

        <div>
          <Label htmlFor="event_image">Event Image URL</Label>
          <Input id="event_image" value={formData.event_image} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className="border-t pt-4">
             <FormBuilder value={customFields} onChange={setCustomFields} />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Event"}</Button>
        </div>
      </form>
    </div>
  );
}
