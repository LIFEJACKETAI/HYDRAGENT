'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Phone,
  PhoneCall,
  Plus,
  Trash2,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  PhoneMissed,
  Voicemail,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Timer,
  User,
  StickyNote,
  MessageSquare,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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

interface CallLog {
  id: string
  customerName: string | null
  customerPhone: string
  direction: string
  duration: number | null
  status: string
  notes: string | null
  recordingUrl: string | null
  createdAt: string
}

// ─── Config Maps ─────────────────────────────────────────────────────────────

const DIRECTION_CONFIG: Record<string, { label: string; className: string; icon: typeof PhoneIncoming }> = {
  inbound: {
    label: 'Inbound',
    className: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800',
    icon: PhoneIncoming,
  },
  outbound: {
    label: 'Outbound',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    icon: PhoneOutgoing,
  },
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  missed: {
    label: 'Missed',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
    icon: XCircle,
  },
  voicemail: {
    label: 'Voicemail',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    icon: Voicemail,
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
    icon: CalendarClock,
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return 'N/A'
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (min === 0) return `${sec} sec`
  if (sec === 0) return `${min} min`
  return `${min} min ${sec} sec`
}

function formatCallDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return `Today at ${format(date, 'h:mm a')}`
  if (isYesterday) return `Yesterday at ${format(date, 'h:mm a')}`
  return format(date, 'MMM d, yyyy h:mm a')
}

function formatAvgDuration(calls: CallLog[]): string {
  const withDuration = calls.filter((c) => c.duration !== null && c.duration > 0)
  if (withDuration.length === 0) return 'N/A'
  const total = withDuration.reduce((sum, c) => sum + (c.duration ?? 0), 0)
  const avg = Math.round(total / withDuration.length)
  return formatDuration(avg)
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
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

const statsVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
}

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CallCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-6 w-10 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: typeof Phone
  label: string
  value: string | number
  color: string
  bgColor: string
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <motion.div variants={statCardVariants}>
      <Card className="transition-shadow duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      variants={emptyVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
        <Phone className="h-8 w-8 text-teal-600 dark:text-teal-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No call logs yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Log your first call to start tracking customer conversations.
      </p>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CallsView() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [logOpen, setLogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Twilio outbound state
  const [twilioOpen, setTwilioOpen] = useState(false)
  const [twilioType, setTwilioType] = useState<'call' | 'sms'>('call')
  const [twilioPhone, setTwilioPhone] = useState('')
  const [twilioMessage, setTwilioMessage] = useState('')
  const [twilioSending, setTwilioSending] = useState(false)
  const [twilioResult, setTwilioResult] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formDirection, setFormDirection] = useState('inbound')
  const [formDuration, setFormDuration] = useState('')
  const [formStatus, setFormStatus] = useState('completed')
  const [formNotes, setFormNotes] = useState('')

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/calls')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCalls(data)
    } catch (err) {
      console.error('Failed to fetch calls:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  // ─── Stats ────────────────────────────────────────────────────────────────

  const totalCalls = calls.length
  const completedCalls = calls.filter((c) => c.status === 'completed').length
  const missedCalls = calls.filter((c) => c.status === 'missed').length
  const avgDuration = formatAvgDuration(calls)

  // ─── Log Call ─────────────────────────────────────────────────────────────

  const handleLogCall = async () => {
    if (!formPhone.trim()) return
    try {
      setSubmitting(true)
      const payload: Record<string, unknown> = {
        customerName: formName.trim() || null,
        customerPhone: formPhone.trim(),
        direction: formDirection,
        status: formStatus,
        notes: formNotes.trim() || null,
      }
      if (formDuration && !isNaN(Number(formDuration))) {
        payload.duration = Number(formDuration) * 60 // Convert minutes to seconds
      }
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to log call')
      setLogOpen(false)
      resetForm()
      fetchCalls()
    } catch (err) {
      console.error('Failed to log call:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this call log?')) return
    try {
      setDeleting(id)
      const res = await fetch(`/api/calls/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setCalls((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Failed to delete call log:', err)
    } finally {
      setDeleting(null)
    }
  }

  // ─── Twilio Outbound ──────────────────────────────────────────────────

  const handleTwilioAction = async () => {
    if (!twilioPhone.trim()) return
    try {
      setTwilioSending(true)
      setTwilioResult(null)
      const res = await fetch('/api/twilio/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: twilioType,
          to: twilioPhone.startsWith('+') ? twilioPhone : `+${twilioPhone.replace(/[^\d]/g, '')}`,
          ...(twilioType === 'sms' ? { message: twilioMessage || 'Hello from HYDRAGENT!' } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setTwilioResult(
        twilioType === 'call'
          ? `Call initiated! SID: ${data.sid}`
          : `SMS sent! SID: ${data.sid}`
      )
      fetchCalls()
    } catch (err) {
      setTwilioResult(err instanceof Error ? err.message : 'Failed')
    } finally {
      setTwilioSending(false)
    }
  }

  const openTwilioDialog = (type: 'call' | 'sms', phone?: string) => {
    setTwilioType(type)
    setTwilioPhone(phone || '')
    setTwilioMessage('')
    setTwilioResult(null)
    setTwilioOpen(true)
  }

  // ─── Form Helpers ─────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormName('')
    setFormPhone('')
    setFormDirection('inbound')
    setFormDuration('')
    setFormStatus('completed')
    setFormNotes('')
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="space-y-6" aria-label="Call management">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Call Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">Track customer calls, voicemails, and scheduled callbacks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
            onClick={() => openTwilioDialog('call')}
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={() => openTwilioDialog('sms')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </Button>
          <Dialog open={logOpen} onOpenChange={(open) => { setLogOpen(open); if (open) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Log Call
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-600" />
                Log a Call
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="call-name">
                    <User className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Customer Name
                  </Label>
                  <Input
                    id="call-name"
                    placeholder="John Smith"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-phone">
                    <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Customer Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="call-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="call-direction">Direction</Label>
                  <Select value={formDirection} onValueChange={setFormDirection}>
                    <SelectTrigger id="call-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-duration">
                    <Timer className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Duration (min)
                  </Label>
                  <Input
                    id="call-duration"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-status">Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger id="call-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="voicemail">Voicemail</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="call-notes">
                  <StickyNote className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                  Notes
                </Label>
                <Textarea
                  id="call-notes"
                  placeholder="Any notes about this call..."
                  className="min-h-[100px] resize-y"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleLogCall}
                disabled={!formPhone.trim() || submitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Twilio Outbound Dialog */}
        <Dialog open={twilioOpen} onOpenChange={setTwilioOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {twilioType === 'call' ? (
                  <><PhoneCall className="h-5 w-5 text-amber-600" /> Make a Call</>
                ) : (
                  <><MessageSquare className="h-5 w-5 text-blue-600" /> Send SMS</>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="twilio-to">
                  <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                  Phone Number (E.164) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="twilio-to"
                  type="tel"
                  placeholder={"+1234567890"}
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code, e.g. +1 for US, +44 for UK
                </p>
              </div>
              {twilioType === 'sms' && (
                <div className="space-y-2">
                  <Label htmlFor="twilio-msg">
                    <Send className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Message
                  </Label>
                  <Textarea
                    id="twilio-msg"
                    placeholder="Type your message..."
                    className="min-h-[100px] resize-y"
                    value={twilioMessage}
                    onChange={(e) => setTwilioMessage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {twilioMessage.length}/1600 characters
                  </p>
                </div>
              )}
              {twilioResult && (
                <div className={`rounded-lg px-4 py-3 text-sm ${twilioResult.includes('Failed') || twilioResult.includes('Error')
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  }`}>
                  {twilioResult}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleTwilioAction}
                disabled={!twilioPhone.trim() || twilioSending}
                className={twilioType === 'call'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              >
                {twilioSending ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : twilioType === 'call' ? (
                  <><PhoneCall className="h-4 w-4 mr-2" /> Call Now</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send SMS</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={statsVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={Phone}
              label="Total Calls"
              value={totalCalls}
              color="text-teal-600 dark:text-teal-400"
              bgColor="bg-teal-100 dark:bg-teal-900/30"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={completedCalls}
              color="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-100 dark:bg-emerald-900/30"
            />
            <StatCard
              icon={XCircle}
              label="Missed"
              value={missedCalls}
              color="text-red-600 dark:text-red-400"
              bgColor="bg-red-100 dark:bg-red-900/30"
            />
            <StatCard
              icon={Clock}
              label="Avg Duration"
              value={avgDuration}
              color="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-100 dark:bg-amber-900/30"
            />
          </>
        )}
      </motion.div>

      {/* Call Log List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CallCardSkeleton key={i} />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {calls.map((call) => {
              const dirConfig = DIRECTION_CONFIG[call.direction]
              const DirIcon = dirConfig?.icon ?? Phone
              const statConfig = STATUS_CONFIG[call.status]
              const StatusIcon = statConfig?.icon ?? Phone
              const displayName = call.customerName || 'Unknown'

              return (
                <motion.div key={call.id} variants={itemVariants} layout exit="exit">
                  <Card className="group transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2.5">
                          {/* Name + Phone + Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">
                              {displayName}
                            </span>
                            <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                              {call.customerPhone}
                            </span>
                            <Badge variant="outline" className={dirConfig?.className}>
                              <DirIcon className="h-3 w-3 mr-1" />
                              {dirConfig?.label ?? call.direction}
                            </Badge>
                            <Badge variant="outline" className={statConfig?.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statConfig?.label ?? call.status}
                            </Badge>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Timer className="h-3.5 w-3.5" />
                            <span>{formatDuration(call.duration)}</span>
                          </div>

                          {/* Notes */}
                          {call.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-muted/50 rounded-lg px-3 py-1.5">
                              {call.notes}
                            </p>
                          )}
                        </div>

                        {/* Date + Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap hidden sm:inline">
                              {formatCallDate(call.createdAt)}
                            </span>
                            <span className="whitespace-nowrap sm:hidden">
                              {format(new Date(call.createdAt), 'MMM d')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              onClick={(e) => { e.stopPropagation(); openTwilioDialog('call', call.customerPhone) }}
                              title="Call back"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              onClick={(e) => { e.stopPropagation(); openTwilioDialog('sms', call.customerPhone) }}
                              title="Send SMS"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(call.id)
                            }}
                            disabled={deleting === call.id}
                            aria-label="Delete call log"
                          >
                            {deleting === call.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
    </section>
  )
}