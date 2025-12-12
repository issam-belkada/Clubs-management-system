/**
 * Client-side storage utilities for club data
 * Uses localStorage to persist data without a backend
 */

export interface Member {
  id: string
  name: string
  email: string
  role: "admin" | "member"
  joinDate: string
  bio?: string
}

export interface Project{
  
}

export interface Event {
  id: string
  title: string
  description: string
  start_time:string
  end_time:string
  max_participants:number
  status:string
  location: string
  event_image?: string
  
  formId?: string
}

export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox"
  required: boolean
  options?: string[]
}

export interface EventForm {
  id: string
  eventId: string
  title: string
  fields: FormField[]
  createdAt: string
}

export interface FormResponse {
  id: string
  formId: string
  eventId: string
  memberId: string
  responses: Record<string, string | boolean>
  submittedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  eventId?: string
  completed: boolean
  dueDate: string
  createdAt: string
  end:string
}

export interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  sidebarBg: string
  darkMode: boolean
}

// Members
export const membersStorage = {
  getAll: (): Member[] => {
    const data = localStorage.getItem("club_members")
    return data ? JSON.parse(data) : []
  },
  add: (member: Member) => {
    const members = membersStorage.getAll()
    members.push(member)
    localStorage.setItem("club_members", JSON.stringify(members))
  },
  update: (id: string, updates: Partial<Member>) => {
    const members = membersStorage.getAll()
    const index = members.findIndex((m) => m.id === id)
    if (index !== -1) {
      members[index] = { ...members[index], ...updates }
      localStorage.setItem("club_members", JSON.stringify(members))
    }
  },
  delete: (id: string) => {
    const members = membersStorage.getAll()
    const filtered = members.filter((m) => m.id !== id)
    localStorage.setItem("club_members", JSON.stringify(filtered))
  },
}

// Events
export const eventsStorage = {
  getAll: (): Event[] => {
    const data = localStorage.getItem("club_events")
    return data ? JSON.parse(data) : []
  },
  add: (event: Event) => {
    const events = eventsStorage.getAll()
    events.push(event)
    localStorage.setItem("club_events", JSON.stringify(events))
  },
  update: (id: string, updates: Partial<Event>) => {
    const events = eventsStorage.getAll()
    const index = events.findIndex((e) => e.id === id)
    if (index !== -1) {
      events[index] = { ...events[index], ...updates }
      localStorage.setItem("club_events", JSON.stringify(events))
    }
  },
  delete: (id: string) => {
    const events = eventsStorage.getAll()
    const filtered = events.filter((e) => e.id !== id)
    localStorage.setItem("club_events", JSON.stringify(filtered))
  },
}

// Event Forms
export const formsStorage = {
  getAll: (): EventForm[] => {
    const data = localStorage.getItem("club_forms")
    return data ? JSON.parse(data) : []
  },
  getByEventId: (eventId: string): EventForm | undefined => {
    return formsStorage.getAll().find((f) => f.eventId === eventId)
  },
  add: (form: EventForm) => {
    const forms = formsStorage.getAll()
    forms.push(form)
    localStorage.setItem("club_forms", JSON.stringify(forms))
  },
  update: (id: string, updates: Partial<EventForm>) => {
    const forms = formsStorage.getAll()
    const index = forms.findIndex((f) => f.id === id)
    if (index !== -1) {
      forms[index] = { ...forms[index], ...updates }
      localStorage.setItem("club_forms", JSON.stringify(forms))
    }
  },
  delete: (id: string) => {
    const forms = formsStorage.getAll()
    const filtered = forms.filter((f) => f.id !== id)
    localStorage.setItem("club_forms", JSON.stringify(filtered))
  },
}

// Form Responses
export const responsesStorage = {
  getAll: (): FormResponse[] => {
    const data = localStorage.getItem("club_responses")
    return data ? JSON.parse(data) : []
  },
  getByFormId: (formId: string): FormResponse[] => {
    return responsesStorage.getAll().filter((r) => r.formId === formId)
  },
  add: (response: FormResponse) => {
    const responses = responsesStorage.getAll()
    responses.push(response)
    localStorage.setItem("club_responses", JSON.stringify(responses))
  },
  delete: (id: string) => {
    const responses = responsesStorage.getAll()
    const filtered = responses.filter((r) => r.id !== id)
    localStorage.setItem("club_responses", JSON.stringify(filtered))
  },
}

// Tasks
export const tasksStorage = {
  getAll: (): Task[] => {
    const data = localStorage.getItem("club_tasks")
    return data ? JSON.parse(data) : []
  },
  getByMemberId: (memberId: string): Task[] => {
    return tasksStorage.getAll().filter((t) => t.assignedTo === memberId)
  },
  add: (task: Task) => {
    const tasks = tasksStorage.getAll()
    tasks.push(task)
    localStorage.setItem("club_tasks", JSON.stringify(tasks))
  },
  update: (id: string, updates: Partial<Task>) => {
    const tasks = tasksStorage.getAll()
    const index = tasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      localStorage.setItem("club_tasks", JSON.stringify(tasks))
    }
  },
  delete: (id: string) => {
    const tasks = tasksStorage.getAll()
    const filtered = tasks.filter((t) => t.id !== id)
    localStorage.setItem("club_tasks", JSON.stringify(filtered))
  },
}

// Theme
export const themeStorage = {
  get: (): ThemeSettings => {
    const data = localStorage.getItem("club_theme")
    return data
      ? JSON.parse(data)
      : {
          primaryColor: "264",
          secondaryColor: "45",
          accentColor: "150",
          sidebarBg: "0.42 0.18 264",
          darkMode: false,
        }
  },
  set: (theme: Partial<ThemeSettings>) => {
    const current = themeStorage.get()
    localStorage.setItem("club_theme", JSON.stringify({ ...current, ...theme }))
  },
}
