'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, isFuture } from 'date-fns'
import {
  Plus,
  CalendarDays,
  Clock,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarPlus,
  StickyNote,
  User,
  Hourglass,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  service: string
  date: string
  duration: number
  status: string
  notes: string | null
  createdAt: string
}

type TabStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
  },
  'no-show': {
    label: 'No Show',
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-700',
  },
}

function formatAppointmentDate(dateStr: string): string {
  const date = new Date(dateStr)
  let dayLabel = ''
  if (isToday(date)) dayLabel = 'Today'
  else if (isTomorrow(date)) dayLabel = 'Tomorrow'

  const formatted = format(date, 'EEE, MMM d')
  const time = format(date, 'h:mm a')
  if (dayLabel) return `${dayLabel} at ${time}`
  return `${formatted} at ${time}`
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

const emptyVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AppointmentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabStatus>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formCustomerEmail, setFormCustomerEmail] = useState('')
  const [formCustomerPhone, setFormCustomerPhone] = useState('')
  const [formService, setFormService] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formDuration, setFormDuration] = useState('30')
  const [formNotes, setFormNotes] = useState('')

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/appointments')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAppointments(data)
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getStatusCounts = useCallback((): Record<string, number> => {
    const counts: Record<string, number> = { all: appointments.length }
    for (const a of appointments) {
      counts[a.status] = (counts[a.status] || 0) + 1
    }
    return counts
  }, [appointments])

  const filteredAppointments = activeTab === 'all'
    ? appointments
    : appointments.filter((a) => a.status === activeTab)

  // ─── Form Submission ──────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormCustomerName('')
    setFormCustomerEmail('')
    setFormCustomerPhone('')
    setFormService('')
    setFormDate('')
    setFormDuration('30')
    setFormNotes('')
  }, [])

  const handleSubmit = async () => {
    if (!formCustomerName.trim() || !formService.trim() || !formDate) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formCustomerName.trim(),
          customerEmail: formCustomerEmail.trim() || null,
          customerPhone: formCustomerPhone.trim() || null,
          service: formService.trim(),
          date: formDate,
          duration: parseInt(formDuration, 10),
          notes: formNotes.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create appointment')
      resetForm()
      setDialogOpen(false)
      fetchAppointments()
    } catch (err) {
      console.error('Failed to create appointment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Status Actions ───────────────────────────────────────────────────────

  const updateStatus = async (id: string, status: string) => {
    try {
      setActionLoading(id)
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchAppointments()
    } catch (err) {
      console.error('Failed to update appointment status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return
    try {
      setDeleting(id)
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchAppointments()
    } catch (err) {
      console.error('Failed to delete appointment:', err)
    } finally {
      setDeleting(null)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const statusCounts = getStatusCounts()
  const isFormValid = formCustomerName.trim() && formService.trim() && !!formDate

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all your appointments
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-teal-600 text-white hover:bg-teal-700 gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-teal-600" />
                New Appointment
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="e.g. John Smith"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                />
              </div>

              {/* Customer Email */}
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Customer Email
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={formCustomerEmail}
                  onChange={(e) => setFormCustomerEmail(e.target.value)}
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Customer Phone
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formCustomerPhone}
                  onChange={(e) => setFormCustomerPhone(e.target.value)}
                />
              </div>

              {/* Service */}
              <div className="space-y-2">
                <Label htmlFor="service" className="flex items-center gap-1.5">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  Service <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="service"
                  placeholder="e.g. Haircut, Consultation, Check-up"
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                />
              </div>

              {/* Date & Duration Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-1.5">
                    <Hourglass className="h-3.5 w-3.5 text-muted-foreground" />
                    Duration
                  </Label>
                  <Select value={formDuration} onValueChange={setFormDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-1.5">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || submitting}
                className="bg-teal-600 text-white hover:bg-teal-700 gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Creating...' : 'Create Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabStatus)}
        >
          <TabsList className="w-full flex-wrap gap-1 bg-muted/60 p-1 h-auto">
            {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as TabStatus[]).map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="gap-1.5 data-[state=active]:bg-teal-600 data-[state=active]:text-white text-sm capitalize"
                >
                  {tab}
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 px-1.5 text-[10px] font-semibold tabular-nums"
                  >
                    {statusCounts[tab] || 0}
                  </Badge>
                </TabsTrigger>
              )
            )}
          </TabsList>

          {/* Content for all tabs — same list, filtered */}
          {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as TabStatus[]).map(
            (tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <AppointmentCardSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <motion.div
                    variants={emptyVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/40">
                      <CalendarDays className="h-8 w-8 text-teal-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      No {tab === 'all' ? '' : tab + ' '}appointments
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      {tab === 'all'
                        ? 'Get started by creating your first appointment.'
                        : `There are no ${tab} appointments to show.`}
                    </p>
                    {tab === 'all' && (
                      <Button
                        className="mt-5 bg-teal-600 text-white hover:bg-teal-700 gap-2"
                        onClick={() => setDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        New Appointment
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredAppointments.map((appointment) => {
                        const dateObj = new Date(appointment.date)
                        const isUpcoming = isFuture(dateObj) && appointment.status !== 'completed' && appointment.status !== 'cancelled'

                        return (
                          <motion.div
                            key={appointment.id}
                            variants={itemVariants}
                            layout
                            exit="exit"
                          >
                            <Card
                              className={`overflow-hidden border transition-shadow hover:shadow-md ${
                                isUpcoming
                                  ? 'border-teal-200/60 dark:border-teal-800/40'
                                  : 'border-border/50'
                              }`}
                            >
                              <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col gap-3">
                                  {/* Top Row: Info */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-base font-semibold text-foreground truncate">
                                          {appointment.customerName}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={STATUS_CONFIG[appointment.status]?.className || STATUS_CONFIG['scheduled'].className}
                                        >
                                          {STATUS_CONFIG[appointment.status]?.label || appointment.status}
                                        </Badge>
                                      </div>

                                      <p className="text-sm font-medium text-foreground/80">
                                        {appointment.service}
                                      </p>

                                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                          <CalendarDays className="h-3.5 w-3.5" />
                                          {formatAppointmentDate(appointment.date)}
                                        </span>
                                        <Badge variant="secondary" className="gap-1 text-xs font-normal">
                                          <Clock className="h-3 w-3" />
                                          {appointment.duration} min
                                        </Badge>
                                      </div>

                                      {/* Contact Info */}
                                      {(appointment.customerEmail || appointment.customerPhone) && (
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                                          {appointment.customerEmail && (
                                            <span className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              {appointment.customerEmail}
                                            </span>
                                          )}
                                          {appointment.customerPhone && (
                                            <span className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />
                                              {appointment.customerPhone}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {/* Notes */}
                                      {appointment.notes && (
                                        <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                          {appointment.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions Row */}
                                  <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
                                    {appointment.status === 'scheduled' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 text-xs text-teal-700 border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:text-teal-400 dark:border-teal-700 dark:hover:bg-teal-950"
                                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                                        disabled={actionLoading === appointment.id}
                                      >
                                        {actionLoading === appointment.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Confirm
                                      </Button>
                                    )}

                                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950"
                                        onClick={() => updateStatus(appointment.id, 'completed')}
                                        disabled={actionLoading === appointment.id}
                                      >
                                        {actionLoading === appointment.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Complete
                                      </Button>
                                    )}

                                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 text-xs text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950"
                                        onClick={() => updateStatus(appointment.id, 'cancelled')}
                                        disabled={actionLoading === appointment.id}
                                      >
                                        {actionLoading === appointment.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <XCircle className="h-3.5 w-3.5" />
                                        )}
                                        Cancel
                                      </Button>
                                    )}

                                    <div className="ml-auto">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950"
                                        onClick={() => deleteAppointment(appointment.id)}
                                        disabled={deleting === appointment.id}
                                      >
                                        {deleting === appointment.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                        <span className="sr-only sm:not-sr-only">Delete</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      </motion.div>
    </section>
  )
}