"use client";

import { useState } from "react";
import { EventFeed } from "@/components/event-feed";
import { SearchBar } from "@/components/search-bar";
import { RecommendedEvents } from "@/components/recommended-events";
import { ClubList } from "@/components/club-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Chatbot from "@/components/chatbot";

export default function Home() {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<string[]>([
    "Technology",
    "Science",
  ]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0  z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className=" mx-auto w-full px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold">Scientific Events</h1>
            </div>
            <div className="flex-1">
              <SearchBar
                onSearch={setSearchQuery}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <ClubList />
          <div className="flex-1 max-w-2xl mx-auto w-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="recommended">Trending</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-0">
                <EventFeed
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>

              <TabsContent value="recommended">
                <RecommendedEvents
                  userPreferences={userPreferences}
                  onUpdatePreferences={setUserPreferences}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Chatbot/>
      </div>
    </main>
  );
}
