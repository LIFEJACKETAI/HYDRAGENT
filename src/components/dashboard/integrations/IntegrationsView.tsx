'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  CalendarDays,
  Calendar,
  Mail,
  Phone,
  Clock,
  Workflow,
  Link2,
  Unplug,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Integration {
  id: string
  type: string
  name: string
  status: string
  config: string | null
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
}

interface IntegrationDef {
  type: string
  name: string
  description: string
  icon: typeof CalendarDays
}

// ─── Integration Definitions ─────────────────────────────────────────────────

const INTEGRATION_DEFS: IntegrationDef[] = [
  {
    type: 'google_calendar',
    name: 'Google Calendar',
    description: 'Connect your Google Calendar to sync appointments',
    icon: CalendarDays,
  },
  {
    type: 'outlook_calendar',
    name: 'Outlook Calendar',
    description: 'Sync with Microsoft Outlook Calendar',
    icon: Calendar,
  },
  {
    type: 'sendgrid',
    name: 'SendGrid',
    description: 'Send and receive emails through SendGrid',
    icon: Mail,
  },
  {
    type: 'twilio',
    name: 'Twilio',
    description: 'Make and receive phone calls via Twilio',
    icon: Phone,
  },
  {
    type: 'calendly',
    name: 'Calendly',
    description: 'Let customers book through Calendly',
    icon: Clock,
  },
  {
    type: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    icon: Workflow,
  },
]

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function IntegrationCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2.5">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
        <div className="mt-4 h-9 w-28 animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function IntegrationsView() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [pendingIntegration, setPendingIntegration] = useState<IntegrationDef | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/integrations')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setIntegrations(data)
    } catch (err) {
      console.error('Failed to fetch integrations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getIntegration = (type: string): Integration | undefined =>
    integrations.find((i) => i.type === type)

  const isConnected = (type: string): boolean =>
    getIntegration(type)?.status === 'connected'

  const formatLastSync = (dateStr: string | null): string => {
    if (!dateStr) return ''
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a')
  }

  // ─── Connect ─────────────────────────────────────────────────────────────

  const handleOpenConnect = (def: IntegrationDef) => {
    setPendingIntegration(def)
    setConnectDialogOpen(true)
  }

  const handleConnect = async () => {
    if (!pendingIntegration) return
    try {
      setConnecting(true)
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: pendingIntegration.type,
          name: pendingIntegration.name,
          status: 'connected',
          config: '{}',
        }),
      })
      if (!res.ok) throw new Error('Failed to connect')
      setConnectDialogOpen(false)
      setPendingIntegration(null)
      toast({
        title: 'Integration connected',
        description: `${pendingIntegration.name} has been successfully connected.`,
      })
      fetchIntegrations()
    } catch (err) {
      console.error('Failed to connect integration:', err)
      toast({
        title: 'Connection failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setConnecting(false)
    }
  }

  // ─── Disconnect ──────────────────────────────────────────────────────────

  const handleDisconnect = async (type: string) => {
    const existing = getIntegration(type)
    if (!existing) return

    try {
      setDisconnecting(type)
      const res = await fetch(`/api/integrations/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disconnected' }),
      })
      if (!res.ok) throw new Error('Failed to disconnect')
      toast({
        title: 'Integration disconnected',
        description: `${existing.name} has been disconnected.`,
      })
      fetchIntegrations()
    } catch (err) {
      console.error('Failed to disconnect integration:', err)
      toast({
        title: 'Disconnection failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDisconnecting(null)
    }
  }

  // ─── Connected Count ─────────────────────────────────────────────────────

  const connectedCount = integrations.filter((i) => i.status === 'connected').length

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="space-y-6" aria-label="Integrations management">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Integrations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your favorite tools to automate and streamline your workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
          >
            <Link2 className="h-3 w-3 mr-1" />
            {connectedCount} of {INTEGRATION_DEFS.length} connected
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchIntegrations}
            disabled={loading}
            className="h-9 w-9"
            aria-label="Refresh integrations"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* Integration Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <IntegrationCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {INTEGRATION_DEFS.map((def) => {
            const connected = isConnected(def.type)
            const existing = getIntegration(def.type)
            const Icon = def.icon
            const isDisconnecting = disconnecting === def.type

            return (
              <motion.div key={def.type} variants={cardVariants}>
                <Card className="group transition-all duration-200 hover:shadow-md h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950">
                        <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight">
                          {def.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {def.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {connected ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-gray-500 dark:text-gray-400">
                            Disconnected
                          </Badge>
                        )}
                        {connected && existing?.lastSyncAt && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            Synced {formatLastSync(existing.lastSyncAt)}
                          </span>
                        )}
                      </div>

                      {connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(def.type)}
                          disabled={isDisconnecting}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 shrink-0"
                        >
                          {isDisconnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Unplug className="h-4 w-4 mr-1.5" />
                          )}
                          <span className="hidden sm:inline">Disconnect</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenConnect(def)}
                          className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm shrink-0"
                        >
                          <Link2 className="h-4 w-4 mr-1.5" />
                          <span className="hidden sm:inline">Connect</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Connect Dialog */}
      <AnimatePresence>
        {connectDialogOpen && pendingIntegration && (
          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950">
                    {(() => {
                      const Icon = pendingIntegration.icon
                      return <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    })()}
                  </div>
                  Connect {pendingIntegration.name}
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your {pendingIntegration.name} account to enable{' '}
                  {pendingIntegration.description.toLowerCase()}. This will allow HYDRAGENT
                  to interact with {pendingIntegration.name} on your behalf.
                </p>
                <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-3">
                  <p className="text-xs font-medium text-foreground">Integration</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{pendingIntegration.name}</p>
                  <p className="text-xs font-medium text-foreground mt-2">Type</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{pendingIntegration.type}</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  )
}