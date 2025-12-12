"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import axios from "axios"
import Link from "next/link"

interface Club {
  id: number
  name: string
  logo_url: string | null
  description: string | null
}

export function ClubsSidebar() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClubs = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/clubs")
            setClubs(res.data.data.data) // Assuming pagination wrapping
        } catch (error) {
            console.error("Failed to fetch clubs", error)
        } finally {
            setLoading(false)
        }
    }
    fetchClubs()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="h-fit sticky top-20 border-none shadow-none bg-transparent">
      <CardHeader className="pb-3 pt-0">
        <CardTitle className="text-lg font-semibold text-muted-foreground">Clubs for you</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {clubs.map((club) => (
          <Link href={`/club/${club.id}`} key={club.id} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={club.logo_url || ""} alt={club.name} />
              <AvatarFallback>{club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">{club.name}</span>
              {club.description && (
                <span className="text-xs text-muted-foreground truncate w-full">
                  {club.description}
                </span>
              )}
            </div>
          </Link>
        ))}
        {clubs.length === 0 && (
            <p className="text-sm text-muted-foreground">No clubs found.</p>
        )}
      </CardContent>
    </Card>
  )
}
