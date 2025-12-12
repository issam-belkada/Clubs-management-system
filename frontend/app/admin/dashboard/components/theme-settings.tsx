"use client"

import { useState, useEffect } from "react"
import { themeStorage, type ThemeSettings as ThemeSettingsType } from "@/lib/storage"
import { Palette, RotateCcw } from "lucide-react"

export function ThemeSettings() {
  const [theme, setTheme] = useState<ThemeSettingsType | null>(null)

  useEffect(() => {
    setTheme(themeStorage.get())
  }, [])

  const updateTheme = (updates: Partial<ThemeSettingsType>) => {
    themeStorage.set(updates)
    setTheme((prev) => (prev ? { ...prev, ...updates } : null))
    applyTheme(updates)
  }

  const applyTheme = (themeUpdates: Partial<ThemeSettingsType>) => {
    const root = document.documentElement
    if (themeUpdates.darkMode !== undefined) {
      if (themeUpdates.darkMode) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  const resetTheme = () => {
    const defaultTheme: ThemeSettingsType = {
      primaryColor: "264",
      secondaryColor: "45",
      accentColor: "150",
      sidebarBg: "0.42 0.18 264",
      darkMode: false,
    }
    setTheme(defaultTheme)
    themeStorage.set(defaultTheme)
    document.documentElement.classList.remove("dark")
  }

  if (!theme) return null

  const themePresets = [
    { name: "Ocean Blue", primary: "264", secondary: "45", accent: "150" },
    { name: "Forest Green", primary: "150", secondary: "90", accent: "45" },
    { name: "Sunset Orange", primary: "45", secondary: "30", accent: "264" },
    { name: "Purple Dream", primary: "290", secondary: "270", accent: "45" },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Theme Settings</h1>
        <p className="text-muted-foreground mt-1">Customize the dashboard appearance</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Palette size={24} />
            Quick Presets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {themePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  updateTheme({
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary,
                    accentColor: preset.accent,
                  })
                }}
                className="p-4 rounded-lg border-2 border-border hover:border-primary transition text-left"
              >
                <p className="font-semibold text-foreground">{preset.name}</p>
                <div className="flex gap-2 mt-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: `oklch(0.5 0.2 ${preset.primary})` }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: `oklch(0.5 0.2 ${preset.secondary})` }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: `oklch(0.5 0.2 ${preset.accent})` }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Display Mode</h2>
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-background rounded-lg border border-border hover:border-primary transition">
            <input
              type="checkbox"
              checked={theme.darkMode}
              onChange={(e) => updateTheme({ darkMode: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Enable dark theme</p>
            </div>
          </label>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Custom Colors</h2>
            <button
              onClick={resetTheme}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
              <RotateCcw size={18} />
              Reset to Default
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Primary Color (Hue)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={Number.parseInt(theme.primaryColor)}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">{theme.primaryColor}°</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Secondary Color (Hue)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={Number.parseInt(theme.secondaryColor)}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">{theme.secondaryColor}°</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Accent Color (Hue)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={Number.parseInt(theme.accentColor)}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">{theme.accentColor}°</p>
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-border space-y-2">
            <p className="text-sm font-medium text-foreground">Note:</p>
            <p className="text-sm text-muted-foreground">
              Color changes are stored locally. Use the sliders above to customize primary, secondary, and accent colors
              to match your club's branding.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
