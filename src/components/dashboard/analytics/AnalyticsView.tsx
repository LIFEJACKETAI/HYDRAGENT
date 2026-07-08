'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  CalendarDays,
  Mail,
  Phone,
  BookOpen,
  MessageSquare,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsData {
  summary: {
    totalAppointments: number
    totalEmails: number
    totalCalls: number
    totalKnowledgeDocs: number
    activeKnowledgeDocs: number
    totalIntegrations: number
    connectedIntegrations: number
    totalChats: number
  }
  appointmentStatus: Record<string, number>
  appointmentsByDay: Record<string, number>
  topServices: { name: string; count: number }[]
  peakHours: { hour: number; label: string; count: number }[]
  appointmentsByDayOfWeek: { name: string; count: number }[]
  avgDuration: number
  emailStats: { total: number; inbound: number; outbound: number }
  callStats: { total: number; inbound: number; outbound: number; missed: number; avgDuration: number }
  knowledgeStats: { total: number; active: number; totalSize: number }
  chatStats: { total: number; userMessages: number; assistantMessages: number }
  business: { name: string; type: string; createdAt: string } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  confirmed: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  noShow: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

// ── Animation ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) setData(await res.json())
      } catch { /* use empty state */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No analytics data available yet.</p>
        </CardContent>
      </Card>
    )
  }

  const { summary, appointmentStatus, appointmentsByDay, topServices, peakHours, appointmentsByDayOfWeek, avgDuration, emailStats, callStats, knowledgeStats, chatStats, business } = data

  // Max values for bar scaling
  const maxDayCount = Math.max(...Object.values(appointmentsByDay), 1)
  const maxServiceCount = topServices.length > 0 ? Math.max(...topServices.map((s) => s.count), 1) : 1
  const maxHourCount = peakHours.length > 0 ? Math.max(...peakHours.map((h) => h.count), 1) : 1
  const maxDayOfWeekCount = Math.max(...appointmentsByDayOfWeek.map((d) => d.count), 1)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Analytics & Reports
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {business ? `Performance insights for ${business.name}` : 'Performance insights for your business'}
            </p>
          </div>
          {business && (
            <Badge variant="outline" className="w-fit capitalize mt-2 sm:mt-0">
              {business.type}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* ── KPI Row ────────────────────────────────────────── */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={CalendarDays}
          label="Appointments"
          value={summary.totalAppointments}
          sub={`${appointmentStatus.confirmed} confirmed, ${appointmentStatus.completed} completed`}
          accent="teal"
          trend={{ value: appointmentStatus.scheduled, label: 'pending' }}
        />
        <KPICard
          icon={Mail}
          label="Emails"
          value={emailStats.total}
          sub={`${emailStats.inbound} inbound, ${emailStats.outbound} outbound`}
          accent="emerald"
          trend={{ value: emailStats.outbound, label: 'sent' }}
        />
        <KPICard
          icon={Phone}
          label="Calls"
          value={callStats.total}
          sub={`Avg ${callStats.avgDuration}s, ${callStats.missed} missed`}
          accent="amber"
          trend={{ value: callStats.missed, label: 'missed', bad: true }}
        />
        <KPICard
          icon={MessageSquare}
          label="Agent Chats"
          value={chatStats.userMessages}
          sub={`${chatStats.assistantMessages} responses`}
          accent="rose"
          trend={{ value: chatStats.total, label: 'total messages' }}
        />
      </motion.div>

      {/* ── Appointments Over Time (Bar Chart) ─────────────── */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950">
                <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle>Appointments — Last 14 Days</CardTitle>
                <CardDescription>Daily booking volume trend</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 sm:gap-2 h-48">
              {Object.entries(appointmentsByDay).map(([date, count]) => (
                <div key={date} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                    {count > 0 ? count : ''}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-teal-500 transition-all duration-500 min-h-[4px]"
                    style={{ height: `${Math.max((count / maxDayCount) * 100, 4)}%` }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(date)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Two Column: Status Donut + Top Services ─────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment Status Breakdown */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>Breakdown by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {Object.entries(appointmentStatus).map(([status, count]) => {
                  const total = summary.totalAppointments || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{status.replace('-', ' ')}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            status === 'completed'
                              ? 'bg-emerald-500'
                              : status === 'confirmed'
                                ? 'bg-teal-500'
                                : status === 'scheduled'
                                  ? 'bg-amber-500'
                                  : status === 'cancelled'
                                    ? 'bg-red-500'
                                    : 'bg-gray-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Average appointment duration: <strong className="text-foreground">{avgDuration} min</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Services */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Most Booked Services</CardTitle>
              <CardDescription>Top services by appointment count</CardDescription>
            </CardHeader>
            <CardContent>
              {topServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No service data yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {topServices.map((service, i) => (
                    <div key={service.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                            {i + 1}
                          </span>
                          <span className="font-medium truncate max-w-[180px]">{service.name}</span>
                        </div>
                        <span className="text-muted-foreground font-medium">{service.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden ml-7">
                        <motion.div
                          className="h-full rounded-full bg-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(service.count / maxServiceCount) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 * i }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Two Column: Peak Hours + Day of Week ───────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peak Booking Hours */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Peak Booking Hours</CardTitle>
              <CardDescription>Most popular appointment times</CardDescription>
            </CardHeader>
            <CardContent>
              {peakHours.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {peakHours.map((h, i) => (
                    <div key={h.hour} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{h.count}</span>
                      <div
                        className="w-full rounded-t-md bg-amber-500 transition-all duration-500 min-h-[4px]"
                        style={{ height: `${(h.count / maxHourCount) * 100}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{h.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Day of Week */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Bookings by Day of Week</CardTitle>
              <CardDescription>Which days are busiest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {appointmentsByDayOfWeek.map((d, i) => (
                  <div key={d.name} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{d.count}</span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 min-h-[4px] ${
                        d.count === maxDayOfWeekCount
                          ? 'bg-teal-500'
                          : d.count > 0
                            ? 'bg-teal-300 dark:bg-teal-700'
                            : 'bg-muted'
                      }`}
                      style={{ height: `${(d.count / maxDayOfWeekCount) * 100}%` }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Communication Channels ─────────────────────────── */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>Communication Channels</CardTitle>
            <CardDescription>How customers interact with your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Emails */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="text-2xl font-bold">{emailStats.total}</div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-teal-500" />
                    {emailStats.inbound} received
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-amber-500" />
                    {emailStats.outbound} sent
                  </span>
                </div>
              </div>

              {/* Calls */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <div className="text-2xl font-bold">{callStats.total}</div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{callStats.inbound} in / {callStats.outbound} out</span>
                  <span className="text-red-500">{callStats.missed} missed</span>
                </div>
              </div>

              {/* Chat */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium">Agent Chat</span>
                </div>
                <div className="text-2xl font-bold">{chatStats.userMessages}</div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{chatStats.userMessages} user msgs</span>
                  <span>{chatStats.assistantMessages} responses</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Knowledge & System Health ───────────────────────── */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Knowledge base and integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <HealthItem
                icon={BookOpen}
                label="Knowledge Docs"
                value={`${knowledgeStats.active} / ${knowledgeStats.total}`}
                sub={`${formatBytes(knowledgeStats.totalSize)} total`}
                healthy={knowledgeStats.active > 0}
              />
              <HealthItem
                icon={CalendarDays}
                label="Avg Appointment"
                value={`${avgDuration} min`}
                sub="average duration"
                healthy={avgDuration > 0}
              />
              <HealthItem
                icon={Phone}
                label="Avg Call"
                value={callStats.avgDuration > 0 ? `${callStats.avgDuration}s` : 'N/A'}
                sub="average duration"
                healthy={callStats.missed === 0}
              />
              <HealthItem
                icon={BarChart3}
                label="Integrations"
                value={`${summary.connectedIntegrations} / ${summary.totalIntegrations}`}
                sub="connected"
                healthy={summary.connectedIntegrations > 0}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: number
  sub: string
  accent: 'teal' | 'emerald' | 'amber' | 'rose'
  trend: { value: number; label: string; bad?: boolean }
}) {
  const accentClasses = {
    teal: 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend.bad ? (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            ) : (
              <ArrowUpRight className="h-3 w-3 text-teal-500" />
            )}
            {trend.value} {trend.label}
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

function HealthItem({
  icon: Icon,
  label,
  value,
  sub,
  healthy,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  healthy: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${healthy ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-amber-100 dark:bg-amber-950'}`}>
        <Icon className={`h-4 w-4 ${healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground/60">{sub}</div>
      </div>
    </div>
  )
}