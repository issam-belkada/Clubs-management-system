"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "textarea";
  required: boolean;
}

interface FormBuilderProps {
  value: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FormBuilder({ value, onChange }: FormBuilderProps) {
  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      label: "",
      type: "text",
      required: true,
    };
    onChange([...value, newField]);
  };

  const removeField = (id: string) => {
    onChange(value.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(value.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Custom Registration Form</h3>
        <Button type="button" onClick={addField} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Add Field
        </Button>
      </div>
      
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No custom fields added.</p>
      )}

      <div className="space-y-3">
        {value.map((field) => (
          <Card key={field.id} className="p-3">
            <CardContent className="p-0 flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="e.g. Student ID"
                />
              </div>
              <div className="w-32 space-y-1">
                <Label className="text-xs">Type</Label>
                 <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="date">Date</option>
                    <option value="textarea">Long Text</option>
                </select>
              </div>
              <div className="pb-2">
                 <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={field.required} 
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded border-gray-300"
                    />
                    Required
                 </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeField(field.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
