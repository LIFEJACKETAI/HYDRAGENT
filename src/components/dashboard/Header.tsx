'use client'

import { useAppStore } from '@/lib/store'
import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  knowledge: 'Knowledge Base',
  appointments: 'Appointments',
  emails: 'Emails',
  calls: 'Calls',
  integrations: 'Integrations',
  embed: 'Embed Widget',
  chat: 'Agent Preview',
  settings: 'Admin & Settings',
}

export function Header() {
  const { activeNav, toggleSidebar } = useAppStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {navLabels[activeNav] || 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500" />
        </Button>
      </div>
    </header>
  )
}