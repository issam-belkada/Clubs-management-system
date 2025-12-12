"use client"

import { useState } from "react"
import { EventFeed } from "@/components/event-feed"
import { ClubsSidebar } from "@/components/clubs-sidebar"
import { UserProfile } from "@/components/user-profile"
import Chatbot from "@/components/chatbot"
import { Home as HomeIcon, Search, Bell, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [activeFeed, setActiveFeed] = useState<"home" | "discover" | "profile">("home");

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Top Navigation Bar - Mobile mostly, or global header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl text-primary">
              Scientific Events
           </div>
           <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
               </Button>
           </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)_280px] lg:grid-cols-[240px_minmax(0,1fr)_300px] md:gap-6 lg:gap-10 pt-6">
        
        {/* Left Sidebar - Navigation */}
        <aside className="fixed top-20 z-30 -ml-2 hidden h-[calc(100vh-5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto">
           <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                 <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Menu
                 </h2>
                 <div className="space-y-1">
                    <Button 
                        variant={activeFeed === "home" ? "secondary" : "ghost"} 
                        className="w-full justify-start"
                        onClick={() => setActiveFeed("home")}
                    >
                        <HomeIcon className="mr-2 h-4 w-4" />
                        Feed
                    </Button>
                    <Button 
                        variant={activeFeed === "discover" ? "secondary" : "ghost"} 
                        className="w-full justify-start"
                        onClick={() => setActiveFeed("discover")}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Discover
                    </Button>
                    <Button 
                        variant={activeFeed === "profile" ? "secondary" : "ghost"} 
                        className="w-full justify-start"
                        onClick={() => setActiveFeed("profile")}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Button>
                 </div>
              </div>
           </div>
        </aside>

        {/* Center - Feed */}
        <main className="relative flex flex-col gap-6 w-full">
            {activeFeed === "profile" ? (
                <UserProfile />
            ) : (
                <EventFeed 
                    key={activeFeed} // Force re-mount when feed changes to trigger fetch
                    endpoint={activeFeed === "home" ? "event-posts/" : "event-posts/trending"} 
                />
            )}
        </main>

        {/* Right Sidebar - Clubs / Friends */}
        <aside className="hidden w-full flex-col md:flex">
             <ClubsSidebar />
        </aside>

      </div>
      <Chatbot />
    </div>
  )
}
