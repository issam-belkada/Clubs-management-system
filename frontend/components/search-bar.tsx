"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORIES = [
  "All Categories",
  "Technology",
  "Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Robotics",
  "AI & Machine Learning",
]

interface SearchBarProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: string | null) => void
}

export function SearchBar({ onSearch, onCategoryChange }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onCategoryChange(value === "All Categories" ? null : value)
  }

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search events or clubs..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button onClick={handleClear} className="absolute right-3 p-1 hover:bg-muted rounded">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
