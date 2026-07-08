'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Mail,
  Plus,
  Send,
  Inbox,
  PenLine,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  MailOpen,
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
import { ScrollArea } from '@/components/ui/scroll-area'

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmailRecord {
  id: string
  from: string
  to: string
  subject: string
  body: string
  direction: string
  status: string
  appointmentId: string | null
  createdAt: string
}

type EmailTab = 'all' | 'inbox' | 'sent' | 'drafts'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DIRECTION_CONFIG: Record<string, { label: string; className: string; icon: typeof ArrowDownLeft }> = {
  inbound: {
    label: 'Inbound',
    className: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800',
    icon: ArrowDownLeft,
  },
  outbound: {
    label: 'Outbound',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    icon: ArrowUpRight,
  },
}

function formatEmailDate(dateStr: string): string {
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

// ─── Skeleton ────────────────────────────────────────────────────────────────

function EmailCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-4 w-56 animate-pulse rounded-md bg-muted" />
          <div className="space-y-1 pt-1">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-4 w-28 animate-pulse rounded bg-muted shrink-0" />
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: EmailTab }) {
  const messages: Record<EmailTab, { icon: typeof Mail; title: string; description: string }> = {
    all: { icon: Mail, title: 'No emails yet', description: 'Your email inbox and sent messages will appear here.' },
    inbox: { icon: Inbox, title: 'No inbound emails', description: 'Emails from patients and contacts will show up here.' },
    sent: { icon: Send, title: 'No sent emails', description: 'Compose and send your first email to get started.' },
    drafts: { icon: PenLine, title: 'No drafts', description: 'Draft emails you save will appear here.' },
  }

  const { icon: Icon, title, description } = messages[tab]

  return (
    <motion.div
      variants={emptyVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
        <Icon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
    </motion.div>
  )
}

// ─── Email Detail Dialog ─────────────────────────────────────────────────────

function EmailDetailDialog({
  email,
  open,
  onOpenChange,
}: {
  email: EmailRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!email) return null
  const dirConfig = DIRECTION_CONFIG[email.direction]
  const DirIcon = dirConfig?.icon ?? Mail

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
              <DirIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <Badge variant="outline" className={dirConfig?.className}>
              {dirConfig?.label ?? email.direction}
            </Badge>
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50">
              {email.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl leading-tight">{email.subject || '(No Subject)'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground w-12">From:</span>
              <span className="font-medium text-foreground truncate">{email.from}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground w-12">To:</span>
              <span className="font-medium text-foreground truncate">{email.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground w-12">Date:</span>
              <span className="text-foreground">{formatEmailDate(email.createdAt)}</span>
            </div>
          </div>

          <ScrollArea className="max-h-72">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed px-1">
              {email.body || '(No content)'}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EmailsView() {
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<EmailTab>('all')
  const [composeOpen, setComposeOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Compose form state
  const [formTo, setFormTo] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/emails')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setEmails(data)
    } catch (err) {
      console.error('Failed to fetch emails:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  // ─── Compose ──────────────────────────────────────────────────────────────

  const handleCompose = async () => {
    if (!formTo.trim() || !formSubject.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'clinic@sunshinedental.com',
          to: formTo.trim(),
          subject: formSubject.trim(),
          body: formBody.trim(),
          direction: 'outbound',
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setComposeOpen(false)
      setFormTo('')
      setFormSubject('')
      setFormBody('')
      fetchEmails()
    } catch (err) {
      console.error('Failed to send email:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredEmails = emails.filter((email) => {
    switch (activeTab) {
      case 'inbox':
        return email.direction === 'inbound'
      case 'sent':
        return email.direction === 'outbound' && email.status !== 'draft'
      case 'drafts':
        return email.status === 'draft'
      default:
        return true
    }
  })

  // ─── Counts ──────────────────────────────────────────────────────────────

  const counts = {
    all: emails.length,
    inbox: emails.filter((e) => e.direction === 'inbound').length,
    sent: emails.filter((e) => e.direction === 'outbound' && e.status !== 'draft').length,
    drafts: emails.filter((e) => e.status === 'draft').length,
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const openEmailDetail = (email: EmailRecord) => {
    setSelectedEmail(email)
    setDetailOpen(true)
  }

  const resetComposeForm = () => {
    setFormTo('')
    setFormSubject('')
    setFormBody('')
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="space-y-6" aria-label="Email management">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Emails</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your inbox, sent messages, and drafts.</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={(open) => { setComposeOpen(open); if (open) resetComposeForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-teal-600" />
                Compose Email
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={formTo}
                  onChange={(e) => setFormTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Body</Label>
                <Textarea
                  id="email-body"
                  placeholder="Write your message..."
                  className="min-h-[160px] resize-y"
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleCompose}
                disabled={!formTo.trim() || !formSubject.trim() || submitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EmailTab)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="gap-1.5">
            All
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inbox" className="gap-1.5">
            Inbox
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
              {counts.inbox}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            Sent
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
              {counts.sent}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-1.5">
            Drafts
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
              {counts.drafts}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Shared email list for all tabs */}
        {['all', 'inbox', 'sent', 'drafts'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <EmailCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredEmails.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <motion.div
                key={`${tab}-list`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredEmails.map((email) => {
                    const dirConfig = DIRECTION_CONFIG[email.direction]
                    const DirIcon = dirConfig?.icon ?? Mail
                    const displayName = email.direction === 'inbound' ? email.from : email.to
                    const contactLabel = email.direction === 'inbound' ? 'From' : 'To'

                    return (
                      <motion.div key={email.id} variants={itemVariants} layout exit="exit">
                        <Card
                          className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800"
                          onClick={() => openEmailDetail(email)}
                        >
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-2">
                                {/* Contact + Direction Badge */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-[320px]">
                                    {displayName}
                                  </span>
                                  <Badge variant="outline" className={dirConfig?.className}>
                                    <DirIcon className="h-3 w-3 mr-1" />
                                    {dirConfig?.label ?? email.direction}
                                  </Badge>
                                </div>

                                {/* Subject */}
                                <p className="text-sm font-medium text-foreground/90 truncate">
                                  {email.subject || '(No Subject)'}
                                </p>

                                {/* Body preview */}
                                {email.body && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {email.body.length > 100 ? email.body.slice(0, 100) + '...' : email.body}
                                  </p>
                                )}
                              </div>

                              {/* Date */}
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pt-0.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="whitespace-nowrap hidden sm:inline">
                                  {formatEmailDate(email.createdAt)}
                                </span>
                                <span className="whitespace-nowrap sm:hidden">
                                  {format(new Date(email.createdAt), 'MMM d')}
                                </span>
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
        ))}
      </Tabs>

      {/* Email Detail Dialog */}
      <EmailDetailDialog email={selectedEmail} open={detailOpen} onOpenChange={setDetailOpen} />
    </section>
  )
}