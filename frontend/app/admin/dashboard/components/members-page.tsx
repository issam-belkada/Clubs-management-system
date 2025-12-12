"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { membersStorage, type Member } from "@/lib/storage"
import { Plus, Trash2, Edit2 } from "lucide-react"

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", role: "member" as const, bio: "" })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = () => {
    setMembers(membersStorage.getAll())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    if (editingId) {
      membersStorage.update(editingId, formData)
      setEditingId(null)
    } else {
      const member: Member = {
        id: Date.now().toString(),
        ...formData,
        joinDate: new Date().toISOString(),
      }
      membersStorage.add(member)
    }

    setFormData({ name: "", email: "", role: "member", bio: "" })
    setShowForm(false)
    loadMembers()
  }

  const handleEdit = (member: Member) => {
    setFormData({ name: member.name, email: member.email, role: member.role, bio: member.bio || "" })
    setEditingId(member.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      membersStorage.delete(id)
      loadMembers()
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground mt-1">Manage club members</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: "", email: "", role: "member", bio: "" })
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">{editingId ? "Edit" : "Add"} Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "member" })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                {editingId ? "Update" : "Add"} Member
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

      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-background transition">
                  <td className="px-6 py-4 text-foreground">{member.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{member.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        member.role === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(member.joinDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="inline-flex items-center gap-1 text-primary hover:opacity-75 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="inline-flex items-center gap-1 text-destructive hover:opacity-75 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No members yet. Add your first member to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
