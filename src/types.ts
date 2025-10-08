
export type Project = {
  id: string
  name: string
  status: 'Planning' | 'Active' | 'On Hold' | 'Complete'
  dueDate?: string
  description?: string
  startDate?: string
  endDate?: string
  locations?: { name: string; address?: string }[]
  teamMembers?: { userId: string; role: string; displayName: string; photoURL?: string }[]
}

export type Task = {
  id: string
  title: string
  status: 'Open' | 'Done'
  stage: 'Pre-production' | 'Production' | 'Post-production'
  dueDate?: string
}

export type InventoryItem = {
  id: string
  name: string
  category: string
  status: 'Available' | 'In Use' | 'Maintenance'
  nextMaintenance?: string
  rentalPricePerDay?: number
}

export type MarketingPost = {
  id: string
  imageUrl?: string
  copy: string
  platforms: string[]
  status: 'Scheduled' | 'Posted' | 'Draft'
  scheduledAt?: string
}

export type Invoice = {
  id: string
  number: string
  total: number
  status: 'Paid' | 'Pending' | 'Overdue'
  dueDate?: string
  issuedAt?: string
}

export type DashboardData = {
  projects: number
  tasksOpen: number
  equipmentAvailablePct: number
  recentProjects: { id: string; name: string; status: string }[]
}
