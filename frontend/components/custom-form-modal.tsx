"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you might have this, or use basic textarea
import { useAuth } from "@/hooks/MyContext";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "textarea";
  required: boolean;
}

interface CustomFormModalProps {
  eventId: number;
  formJson: string; // JSON string of FormField[]
  trigger?: React.ReactNode;
}

export function CustomFormModal({ eventId, formJson, trigger }: CustomFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { token, user } = useAuth();
  
  let fields: FormField[] = [];
  try {
    fields = JSON.parse(formJson);
  } catch (e) {
    console.error("Failed to parse custom form JSON", e);
    return null;
  }

  if (!fields || fields.length === 0) return null;

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) {
        alert("You must be logged in to submit this form.");
        return;
    }
    setLoading(true);

    try {
      // Structure the data as expected by the backend
      // Backend expects 'form_data' as JSON string
      const payload = {
          user_id: user.id, // Assuming user object has id
          form_data: JSON.stringify(formData)
      };

      await axios.post(`http://localhost:8000/api/events/${eventId}/submit-approval`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Form submitted successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Register</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Event Registration</DialogTitle>
          <DialogDescription>
            Please fill out the details below to register for this event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
