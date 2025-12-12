"use client"

import { Users, Calendar, CheckSquare, Palette, BarChart3 } from "lucide-react"

type Page = "dashboard" | "members" | "events" | "tasks" | "theme"

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "members" as const, label: "Members", icon: Users },
    { id: "events" as const, label: "Events", icon: Calendar },
    { id: "tasks" as const, label: "Tasks", icon: CheckSquare },
    
  ]

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground shadow-lg p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sidebar-primary-foreground">Club Scientifique</h1>
        <p className="text-sm text-sidebar-accent-foreground opacity-75">Admin Dashboard</p>
      </div>

      <nav className="sidebar-nav flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`sidebar-nav-item flex items-center gap-3 ${isActive ? "active" : ""}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-accent-foreground opacity-60">v1.0</p>
      </div>
    </aside>
  )
}
