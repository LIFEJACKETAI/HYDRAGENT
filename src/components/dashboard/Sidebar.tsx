'use client'

import Link from 'next/link'
import { useAppStore, type NavItem } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  CalendarDays,
  Mail,
  Phone,
  Plug,
  Code2,
  MessageSquare,
  Settings,
  X,
  Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'embed', label: 'Embed Widget', icon: Code2 },
  { id: 'chat', label: 'Agent Preview', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { activeNav, setActiveNav, sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              HYDRAGENT
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left w-full',
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-teal-600 dark:text-teal-400')} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}