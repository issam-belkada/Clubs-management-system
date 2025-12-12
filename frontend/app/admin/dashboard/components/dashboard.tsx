"use client"

import { use, useEffect, useState } from "react"
import { membersStorage, eventsStorage, tasksStorage, type Task, type Event } from "@/lib/storage"
import { Users, Calendar, CheckSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';

export function Dashboard() {
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    tasks: 0,
    completedTasks: 0,
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])

  useEffect(() => {
    const members = membersStorage.getAll()
    const events = eventsStorage.getAll()
    const tasks = tasksStorage.getAll()
    const completed = tasks.filter((t) => t.completed).length

    setStats({
      members: members.length,
      events: events.length,
      tasks: tasks.length,
      completedTasks: completed,
    })

    setRecentTasks(tasks.slice(-5).reverse())

    const now = new Date()
    const upcoming = events
      .filter((e) => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
    setUpcomingEvents(upcoming)
  }, [])

    const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login"; 
  }

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-primary mt-2">{value}</p>
        </div>
        <Icon className="text-primary opacity-20" size={40} />
      </div>
    </div>
  )
  const route=useRouter();
  return (
    <div className="p-8 space-y-8">
        <div className="flex justify-between">
            <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your club overview.</p>
      </div> 
      <div className="flex gap-4">
        <Button variant="ghost" className="bg-blue-600 hover:bg-blue-700 hover:text-white transition text-white cursor-pointer" onClick={() =>route.push("/main") }>Back</Button>
        <Button variant="ghost" className="bg-blue-600 hover:bg-blue-700 hover:text-white transition text-white cursor-pointer" onClick={handleLogout} >Log Out</Button>
      </div>
      
        </div>
     

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Members" value={stats.members} />
        <StatCard icon={Calendar} label="Events" value={stats.events} />
        <StatCard icon={CheckSquare} label="Total Tasks" value={stats.tasks} />
        <StatCard icon={Clock} label="Completed Tasks" value={stats.completedTasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks yet</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-background rounded border border-border">
                  <input type="checkbox" checked={task.completed} readOnly className="mt-1" />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  {task.completed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Done</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-background rounded border border-border">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
