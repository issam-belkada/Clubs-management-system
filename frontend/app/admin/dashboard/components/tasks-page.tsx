"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  tasksStorage,
  membersStorage,
  type Task,
  type Member,
} from "@/lib/storage";
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import {enUS} from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    end: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTasks(tasksStorage.getAll());
    setMembers(membersStorage.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo || !formData.dueDate) return;

    if (editingId) {
      tasksStorage.update(editingId, formData);
      setEditingId(null);
    } else {
      const task: Task = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      tasksStorage.add(task);
    }

    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      end: "",
    });
    setShowForm(false);
    loadData();
  };

  const handleEdit = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      end: task.end,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const toggleComplete = (task: Task) => {
    tasksStorage.update(task.id, { completed: !task.completed });
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      tasksStorage.delete(id);
      loadData();
    }
  };

  const filteredTasks = filterMember
    ? tasks.filter((t) => t.assignedTo === filterMember)
    : tasks;

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || "Unknown";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage member tasks and assignments
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              assignedTo: "",
              dueDate: "",
              end: "",
            });
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Edit" : "Add"} Task
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <input
                type="date"
                value={formData.end}
                onChange={(e) =>
                  setFormData({ ...formData, end: e.target.value })
                }
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                {editingId ? "Update" : "Add"} Task
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

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterMember(null)}
          className={`px-4 py-2 rounded-lg transition ${
            filterMember === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:opacity-75"
          }`}
        >
          All Members
        </button>
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => setFilterMember(member.id)}
            className={`px-4 py-2 rounded-lg transition ${
              filterMember === member.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:opacity-75"
            }`}
          >
            {member.name}
          </button>
        ))}
      </div>
      <div style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={tasks.map((task: any) => ({
            title: task.title,
            start: new Date(task.dueDate),
            end: new Date(task.end),
            allDay: true,
          }))}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
        />
      </div>
    </div>
  );
}
