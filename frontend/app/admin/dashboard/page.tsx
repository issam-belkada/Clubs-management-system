"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./components/sidebar"
import { Dashboard } from "./components/dashboard"
import { MembersPage } from "./components/members-page"
import { EventsPage } from "./components/events-page"
import { TasksPage } from "./components/tasks-page"
import { ThemeSettings } from "./components/theme-settings"

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
