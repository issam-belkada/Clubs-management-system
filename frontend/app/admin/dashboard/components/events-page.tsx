"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { eventsStorage, type Event } from "@/lib/storage";
import { Plus, Trash2, Edit2, FileText } from "lucide-react";
import { EventFormBuilder } from "./event-form-builder";
import { time } from "console";
import axios from "axios";
import { toast } from "react-toastify";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEventForForm, setSelectedEventForForm] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",

    location: "",
    max_participants: 50,
    status: "Scheduled",
    event_image: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(eventsStorage.getAll());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    if (editingId) {
      eventsStorage.update(editingId, {
        ...formData,
        max_participants: Number.parseInt(formData.max_participants.toString()),
      });
      setEditingId(null);
    } else {
      try {
        const res = await axios.post("http://localhost:8000/api/events", {
          ...formData,
        });
        console.log(res.data);
        toast.success("Event created successfully!");
        const event: Event = {
          id: Date.now().toString(),
          ...formData,
          max_participants: Number.parseInt(
            formData.max_participants.toString()
          ),
        };
        eventsStorage.add(event);
      } catch (error) {
        console.error("Error creating event:", error);
        toast.error("Failed to create event.");
      }
    }

    setFormData({
      title: "",
      status: "Scheduled",
      event_image: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      max_participants: 50,
    });
    setShowForm(false);
    loadEvents();
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      event_image: event.event_image || "",
      status: event.status,
      location: event.location,
      max_participants: event.max_participants,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      eventsStorage.delete(id);
      loadEvents();
    }
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setFormData((prev) => ({
      ...prev,
      event_image: data.url,
    }));
    setLoading(false);
  };

  if (selectedEventForForm) {
    return (
      <EventFormBuilder
        eventId={selectedEventForForm}
        onBack={() => {
          setSelectedEventForForm(null);
          loadEvents();
        }}
      />
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">Manage club events</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              start_time: "",
              end_time: "",
              status: "",
              location: "",
              max_participants: 50,
              event_image: "",
            });
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Edit" : "Add"} Event
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="file"
              onChange={handleUpload}
              placeholder="Event Image"
              className="block w-full my-3 py-2 cursor-pointer rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
            />
            <input
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 m-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 my-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  max participants
                </label>
                <input
                  type="number"
                  placeholder="max participants"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: parseInt(e.target.value),
                    })
                  }
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                {editingId ? "Update" : "Add"} Event
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition"
          >
            <h3 className="text-lg font-bold text-foreground mb-2">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {event.description}
            </p>
            <div className="space-y-1 mb-4 text-sm text-muted-foreground">
              <p>
                📅{" "}
                {new Date(event.start_time).toLocaleDateString() +
                  " -> " +
                  new Date(event.end_time).toLocaleDateString()}{" "}
              </p>
              <p>📍 {event.location}</p>
              <p>👥 Capacity: {event.max_participants}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedEventForForm(event.id)}
                className="flex items-center gap-1 text-accent hover:opacity-75 transition text-sm"
              >
                <FileText size={16} />
                Build Form
              </button>
              <button
                onClick={() => handleEdit(event)}
                className="flex items-center gap-1 text-primary hover:opacity-75 transition text-sm"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="flex items-center gap-1 text-destructive hover:opacity-75 transition text-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No events yet. Create your first event to get started.
        </div>
      )}
    </div>
  );
}
