"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { EventCard } from "@/components/event-card"
import { Loader2 } from "lucide-react"
import { mockEvents } from "@/lib/mock-data"

interface EventFeedProps {
  searchQuery: string
  selectedCategory: string | null
}

const EVENTS_PER_PAGE = 8

export function EventFeed({ searchQuery, selectedCategory }: EventFeedProps) {
  const [displayedEvents, setDisplayedEvents] = useState(mockEvents.slice(0, EVENTS_PER_PAGE))
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Filter events based on search and category
  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === null || event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Load more events
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate network delay
    setTimeout(() => {
      const nextPage = page + 1
      const startIndex = 0
      const endIndex = nextPage * EVENTS_PER_PAGE

      const newEvents = filteredEvents.slice(0, endIndex)
      setDisplayedEvents(newEvents)
      setPage(nextPage)
      setIsLoading(false)

      if (endIndex >= filteredEvents.length) {
        setHasMore(false)
      }
    }, 500)
  }, [page, isLoading, hasMore, filteredEvents])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, isLoading])

  // Reset when filters change
  useEffect(() => {
    
    setPage(1)
    setHasMore(true)
  }, [searchQuery, selectedCategory, filteredEvents])

  return (
    <div className="space-y-4">
      {displayedEvents.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No events found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          {displayedEvents.map((event, idx) => (
            <EventCard key={idx} event={event} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="py-8 flex justify-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : hasMore ? (
              <p className="text-muted-foreground text-sm">Loading more events...</p>
            ) : (
              <p className="text-muted-foreground text-sm">No more events</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
