'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, BookOpen, Mail, Phone, PhoneCall, MailIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCard {
  label: string
  value: number
  trend: string
  icon: React.ElementType
  accentClass: string
  iconBgClass: string
  trendUp: boolean
}

interface Activity {
  id: string
  type: 'appointment' | 'email' | 'call'
  description: string
  time: string
  status?: string
}

interface Appointment {
  id: string
  customerName: string
  service: string
  date: string
  status: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function formatAppointmentDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (isToday) return `Today, ${timeStr}`
  if (isTomorrow) return `Tomorrow, ${timeStr}`
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${timeStr}`
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'scheduled':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    case 'no-show':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

const activityIconMap = {
  appointment: CalendarDays,
  email: Mail,
  call: Phone,
}

const activityIconColor = {
  appointment: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40 dark:text-teal-400',
  email: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400',
  call: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-400',
}

// ─── Skeleton Components ─────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DashboardView() {
  const [stats, setStats] = useState<StatCard[] | null>(null)
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [upcoming, setUpcoming] = useState<Appointment[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [appointmentsRes, emailsRes, callsRes, knowledgeRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/emails'),
          fetch('/api/calls'),
          fetch('/api/knowledge'),
        ])

        const appointments: Appointment[] = await appointmentsRes.json()
        const emails = await emailsRes.json()
        const calls = await callsRes.json()
        const knowledge = await knowledgeRes.json()

        // ── Compute stats ──
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

        const weekAppointments = appointments.filter(
          (a) => new Date(a.date) >= weekAgo
        ).length
        const weekEmails = (emails as { createdAt: string }[]).filter(
          (e) => new Date(e.createdAt) >= weekAgo
        ).length
        const monthCalls = (calls as { createdAt: string }[]).filter(
          (c) => new Date(c.createdAt) >= monthAgo
        ).length
        const weekCalls = (calls as { createdAt: string }[]).filter(
          (c) => new Date(c.createdAt) >= weekAgo
        ).length

        const statCards: StatCard[] = [
          {
            label: 'Total Appointments',
            value: appointments.length,
            trend: `+${weekAppointments} this week`,
            icon: CalendarDays,
            accentClass: 'text-teal-600 dark:text-teal-400',
            iconBgClass: 'bg-teal-100 dark:bg-teal-900/40',
            trendUp: weekAppointments > 0,
          },
          {
            label: 'Knowledge Documents',
            value: (knowledge as { id: string }[]).length,
            trend: `${(knowledge as { isActive: boolean }[]).filter((d) => d.isActive).length} active`,
            icon: BookOpen,
            accentClass: 'text-amber-600 dark:text-amber-400',
            iconBgClass: 'bg-amber-100 dark:bg-amber-900/40',
            trendUp: true,
          },
          {
            label: 'Emails This Week',
            value: weekEmails,
            trend: `+${weekEmails} this week`,
            icon: Mail,
            accentClass: 'text-emerald-600 dark:text-emerald-400',
            iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/40',
            trendUp: weekEmails > 0,
          },
          {
            label: 'Calls This Month',
            value: monthCalls,
            trend: `+${weekCalls} this week`,
            icon: Phone,
            accentClass: 'text-rose-600 dark:text-rose-400',
            iconBgClass: 'bg-rose-100 dark:bg-rose-900/40',
            trendUp: weekCalls > 0,
          },
        ]
        setStats(statCards)

        // ── Build recent activity (mixed, latest 5) ──
        const allActivities: Activity[] = [
          ...appointments.slice(0, 5).map((a) => ({
            id: a.id,
            type: 'appointment' as const,
            description: `New appointment: ${a.customerName} — ${a.service}`,
            time: relativeTime(a.date),
            status: a.status,
          })),
          ...(emails as { id: string; subject: string; from: string; to: string; createdAt: string }[])
            .slice(0, 5)
            .map((e) => ({
              id: e.id,
              type: 'email' as const,
              description: `Email: ${e.subject}`,
              time: relativeTime(e.createdAt),
            })),
          ...(calls as { id: string; customerName: string | null; customerPhone: string; createdAt: string; direction: string }[])
            .slice(0, 5)
            .map((c) => ({
              id: c.id,
              type: 'call' as const,
              description: `${c.direction === 'inbound' ? 'Inbound' : 'Outbound'} call: ${c.customerName ?? c.customerPhone}`,
              time: relativeTime(c.createdAt),
            })),
        ].sort((a, b) => {
          // Rough sort by the "ago" text — just keep API order since they're already date-desc
          return 0
        })
        setActivities(allActivities.slice(0, 5))

        // ── Upcoming appointments (future dates) ──
        const upcomingAppts = appointments
          .filter((a) => new Date(a.date) >= now && a.status !== 'cancelled')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
        setUpcoming(upcomingAppts)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ── Render ──

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Heading */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your HYDRAGENT activity and upcoming schedule.
        </p>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats?.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} variants={itemVariants}>
                  <Card className="p-6 transition-shadow duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold tracking-tight text-foreground">
                          {stat.value}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          {stat.trendUp && (
                            <span className="text-emerald-600 dark:text-emerald-400">↑</span>
                          )}
                          {stat.trend}
                        </p>
                      </div>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconBgClass}`}
                      >
                        <Icon className={`h-5 w-5 ${stat.accentClass}`} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)
              ) : activities && activities.length > 0 ? (
                activities.map((activity) => {
                  const Icon = activityIconMap[activity.type]
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          activityIconColor[activity.type]
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                          {activity.status && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${statusVariant(activity.status)}`}
                            >
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)
              ) : upcoming && upcoming.length > 0 ? (
                upcoming.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
                      <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {appt.customerName}
                        </p>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-1.5 py-0 ${statusVariant(appt.status)}`}
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {appt.service}
                      </p>
                      <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-1">
                        {formatAppointmentDate(appt.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}