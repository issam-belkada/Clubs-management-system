"use client"

import { useState, useEffect } from "react"
import { formsStorage, type EventForm, type FormField } from "@/lib/storage"
import { Plus, Trash2, ChevronLeft } from "lucide-react"

interface EventFormBuilderProps {
  eventId: string
  onBack: () => void
}

export function EventFormBuilder({ eventId, onBack }: EventFormBuilderProps) {
  const [form, setForm] = useState<EventForm | null>(null)
  const [fieldData, setFieldData] = useState<{ label: string; type: FormField['type']; required: boolean; options: string }>({
    label: "",
    type: "text",
    required: false,
    options: "",
  })

  useEffect(() => {
    const existing = formsStorage.getByEventId(eventId)
    if (existing) {
      setForm(existing)
    } else {
      const newForm: EventForm = {
        id: Date.now().toString(),
        eventId,
        title: "Event Registration Form",
        fields: [],
        createdAt: new Date().toISOString(),
      }
      formsStorage.add(newForm)
      setForm(newForm)
    }
  }, [eventId])

  const addField = () => {
    if (!form || !fieldData.label) return

    const newField: FormField = {
      id: Date.now().toString(),
      label: fieldData.label,
      type: fieldData.type,     
      required: fieldData.required,
      options: fieldData.type === "select" ? fieldData.options.split("\n").filter((o) => o) : undefined,
    }

    const updated = {
      ...form,
      fields: [...form.fields, newField],
    }
    formsStorage.update(form.id, updated)
    setForm(updated)
    setFieldData({ label: "", type: "text", required: false, options: "" })
  }

  const removeField = (fieldId: string) => {
    if (!form) return
    const updated = {
      ...form,
      fields: form.fields.filter((f) => f.id !== fieldId),
    }
    formsStorage.update(form.id, updated)
    setForm(updated)
  }

  if (!form) return null

  return (
    <div className="p-8 space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary hover:opacity-75 transition">
        <ChevronLeft size={20} />
        Back to Events
      </button>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Event Registration Form</h1>
        <p className="text-muted-foreground mt-1">Customize the form for event participants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border space-y-4">
            <h2 className="text-lg font-bold text-foreground">{form.title}</h2>
            {form.fields.length === 0 ? (
              <p className="text-muted-foreground text-sm">No fields added yet</p>
            ) : (
              form.fields.map((field) => (
                <div
                  key={field.id}
                  className="p-4 bg-background rounded border border-border flex items-start justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{field.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {field.type} {field.required && "(Required)"}
                    </p>
                    {field.options && (
                      <div className="text-xs text-muted-foreground mt-1">Options: {field.options.join(", ")}</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-destructive hover:opacity-75 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-4">Add Field</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Field Label"
              value={fieldData.label}
              onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={fieldData.type}
              onChange={(e) => setFieldData({ ...fieldData, type: e.target.value as FormField['type'] })}
              
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
            </select>

            {fieldData.type === "select" && (
              <textarea
                placeholder="Options (one per line)"
                value={fieldData.options}
                onChange={(e) => setFieldData({ ...fieldData, options: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fieldData.required}
                onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-foreground">Required</span>
            </label>

            <button
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:opacity-90 transition text-sm"
            >
              <Plus size={16} />
              Add Field
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
