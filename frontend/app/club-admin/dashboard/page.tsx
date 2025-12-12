"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../admin/dashboard/components/sidebar"
import { Dashboard } from "../../admin/dashboard/components/dashboard"
import { MembersPage } from "../../admin/dashboard/components/members-page"
import { EventsPage } from "../../admin/dashboard/components/events-page"
import { TasksPage } from "../../admin/dashboard/components/tasks-page"
import { ThemeSettings } from "../../admin/dashboard/components/theme-settings"

type Page = "dashboard" | "members" | "events" | "tasks" | "theme"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "members" && <MembersPage />}
        {currentPage === "events" && <EventsPage />}
        {currentPage === "tasks" && <TasksPage />}
        {currentPage === "theme" && <ThemeSettings />}
      </main>
    </div>
  )
}
