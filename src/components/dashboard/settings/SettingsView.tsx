'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Bot,
  Save,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Loader2,
  Shield,
  Download,
  Database,
  HardDrive,
  Activity,
  Wrench,
  FileText,
  CalendarDays,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BusinessData {
  name: string
  type: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  hours: string
}

interface AgentConfig {
  agentName: string
  welcomeMessage: string
  responseTone: string
  maxResponseLength: string
  autoConfirmAppointments: boolean
  collectCustomerInfo: boolean
}

interface DbStats {
  appointments: number
  emails: number
  calls: number
  knowledge: number
  integrations: number
  chatMessages: number
}

const BUSINESS_TYPES = [
  'Restaurant',
  'Doctor',
  'Dentist',
  'Car Mechanic',
  'Salon',
  'Spa',
  'Gym',
  'Legal',
  'Real Estate',
  'Veterinary',
  'Photography',
  'Fitness Trainer',
  'Consulting',
  'Other',
]

const RESPONSE_TONES = ['Professional', 'Friendly', 'Casual', 'Formal']
const RESPONSE_LENGTHS = ['Short', 'Medium', 'Detailed']

const DEFAULT_BUSINESS: BusinessData = {
  name: '', type: '', description: '', address: '',
  phone: '', email: '', website: '', hours: '',
}

const DEFAULT_AGENT: AgentConfig = {
  agentName: 'HYDRAGENT',
  welcomeMessage: 'Hi! How can I help you today?',
  responseTone: 'Friendly',
  maxResponseLength: 'Medium',
  autoConfirmAppointments: true,
  collectCustomerInfo: false,
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SettingsView() {
  const [business, setBusiness] = useState<BusinessData>(DEFAULT_BUSINESS)
  const [agent, setAgent] = useState<AgentConfig>(DEFAULT_AGENT)
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isClearing, setIsClearing] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load data on mount
  useEffect(() => {
    async function load() {
      try {
        const [bizRes, analyticsRes] = await Promise.all([
          fetch('/api/business'),
          fetch('/api/analytics'),
        ])
        if (bizRes.ok) {
          const data = await bizRes.json()
          setBusiness({
            name: data.name || '', type: data.type || '',
            description: data.description || '', address: data.address || '',
            phone: data.phone || '', email: data.email || '',
            website: data.website || '', hours: data.hours || '',
          })
          if (data.agentName) setAgent((p) => ({ ...p, agentName: data.agentName }))
          if (data.welcomeMessage) setAgent((p) => ({ ...p, welcomeMessage: data.welcomeMessage }))
          if (data.responseTone) setAgent((p) => ({ ...p, responseTone: data.responseTone }))
          if (data.maxResponseLength) setAgent((p) => ({ ...p, maxResponseLength: data.maxResponseLength }))
          if (data.autoConfirmAppointments !== undefined) setAgent((p) => ({ ...p, autoConfirmAppointments: data.autoConfirmAppointments }))
          if (data.collectCustomerInfo !== undefined) setAgent((p) => ({ ...p, collectCustomerInfo: data.collectCustomerInfo }))
        }
        if (analyticsRes.ok) {
          const a = await analyticsRes.json()
          setDbStats({
            appointments: a.summary.totalAppointments,
            emails: a.summary.totalEmails,
            calls: a.summary.totalCalls,
            knowledge: a.summary.totalKnowledgeDocs,
            integrations: a.summary.totalIntegrations,
            chatMessages: a.summary.totalChats,
          })
        }
      } catch { /* defaults */ } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  const saveBusiness = useCallback(async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...business, ...agent }),
      })
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch { /* fail */ } finally {
      setIsSaving(false)
    }
  }, [business, agent])

  const resetAllData = useCallback(async () => {
    setIsResetting(true)
    try {
      await fetch('/api/seed', { method: 'POST' })
      const analyticsRes = await fetch('/api/analytics')
      if (analyticsRes.ok) {
        const a = await analyticsRes.json()
        setDbStats({
          appointments: a.summary.totalAppointments,
          emails: a.summary.totalEmails,
          calls: a.summary.totalCalls,
          knowledge: a.summary.totalKnowledgeDocs,
          integrations: a.summary.totalIntegrations,
          chatMessages: a.summary.totalChats,
        })
      }
    } catch { /* fail */ } finally {
      setIsResetting(false)
    }
  }, [])

  const clearDataType = useCallback(async (type: string) => {
    setIsClearing(type)
    try {
      await fetch(`/api/${type}`, { method: 'DELETE' })
      // Refresh stats
      const analyticsRes = await fetch('/api/analytics')
      if (analyticsRes.ok) {
        const a = await analyticsRes.json()
        setDbStats({
          appointments: a.summary.totalAppointments,
          emails: a.summary.totalEmails,
          calls: a.summary.totalCalls,
          knowledge: a.summary.totalKnowledgeDocs,
          integrations: a.summary.totalIntegrations,
          chatMessages: a.summary.totalChats,
        })
      }
    } catch { /* fail */ } finally {
      setIsClearing(null)
    }
  }, [])

  const exportData = useCallback(async () => {
    try {
      const [appts, emails, calls, knowledge, biz] = await Promise.all([
        fetch('/api/appointments').then((r) => r.json()),
        fetch('/api/emails').then((r) => r.json()),
        fetch('/api/calls').then((r) => r.json()),
        fetch('/api/knowledge').then((r) => r.json()),
        fetch('/api/business').then((r) => r.json()),
      ])
      const exportObj = { business: biz, appointments: appts, emails, calls, knowledge, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hydragent-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* fail */ }
  }, [])

  function updateBusiness(field: keyof BusinessData, value: string) {
    setBusiness((prev) => ({ ...prev, [field]: value }))
  }

  function updateAgent<T extends keyof AgentConfig>(field: T, value: AgentConfig[T]) {
    setAgent((prev) => ({ ...prev, [field]: value }))
  }

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const totalRecords = dbStats ? Object.values(dbStats).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="flex flex-col gap-6">

      {/* ═══ Business Profile ══════════════════════════════════ */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950">
                <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Change the name, type, and all details to match your client&apos;s business. This is what the agent uses to identify itself.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={business.name}
                  onChange={(e) => updateBusiness('name', e.target.value)}
                  placeholder="e.g. Sunrise Dental Clinic, Joe's Auto Repair, The Spice Room..."
                />
                <p className="text-xs text-muted-foreground">
                  This is the primary name your agent will use when referring to the business.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={business.type} onValueChange={(val) => updateBusiness('type', val)}>
                  <SelectTrigger id="business-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Helps the agent tailor its responses (e.g. a restaurant vs a dental clinic).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-phone">Phone</Label>
                <Input
                  id="business-phone"
                  value={business.phone}
                  onChange={(e) => updateBusiness('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-email">Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  value={business.email}
                  onChange={(e) => updateBusiness('email', e.target.value)}
                  placeholder="hello@yourbusiness.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-website">Website</Label>
                <Input
                  id="business-website"
                  value={business.website}
                  onChange={(e) => updateBusiness('website', e.target.value)}
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="business-address">Address</Label>
                <Input
                  id="business-address"
                  value={business.address}
                  onChange={(e) => updateBusiness('address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="business-description">Description</Label>
                <Textarea
                  id="business-description"
                  value={business.description}
                  onChange={(e) => updateBusiness('description', e.target.value)}
                  placeholder="A brief description of the business, services offered, specializations..."
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="business-hours">Business Hours</Label>
                <Textarea
                  id="business-hours"
                  value={business.hours}
                  onChange={(e) => updateBusiness('hours', e.target.value)}
                  placeholder="Mon-Fri 9am-5pm, Sat 10am-2pm, Sun Closed"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  The agent uses this to answer &quot;when are you open?&quot; questions.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={saveBusiness} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
              {saveSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-teal-600 dark:text-teal-400"
                >
                  Saved successfully
                </motion.span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ Agent Behavior ══════════════════════════════════════ */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                <Bot className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Agent Behavior</CardTitle>
                <CardDescription>Configure how your AI agent talks to customers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={agent.agentName}
                  onChange={(e) => updateAgent('agentName', e.target.value)}
                  placeholder="e.g. Sunshine Assistant, Booking Bot, Dr. Smith's Receptionist"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  value={agent.welcomeMessage}
                  onChange={(e) => updateAgent('welcomeMessage', e.target.value)}
                  placeholder="Hi! How can I help you today?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-tone">Response Tone</Label>
                <Select value={agent.responseTone} onValueChange={(val) => updateAgent('responseTone', val)}>
                  <SelectTrigger id="response-tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSE_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-length">Max Response Length</Label>
                <Select value={agent.maxResponseLength} onValueChange={(val) => updateAgent('maxResponseLength', val)}>
                  <SelectTrigger id="response-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSE_LENGTHS.map((len) => (
                      <SelectItem key={len} value={len}>{len}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
                <div className="space-y-0.5">
                  <Label>Auto-confirm Appointments</Label>
                  <p className="text-sm text-muted-foreground">Automatically confirm new appointments without manual review</p>
                </div>
                <Switch
                  checked={agent.autoConfirmAppointments}
                  onCheckedChange={(checked) => updateAgent('autoConfirmAppointments', checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
                <div className="space-y-0.5">
                  <Label>Collect Customer Info</Label>
                  <p className="text-sm text-muted-foreground">Ask customers for their name, email, and phone during conversations</p>
                </div>
                <Switch
                  checked={agent.collectCustomerInfo}
                  onCheckedChange={(checked) => updateAgent('collectCustomerInfo', checked)}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={saveBusiness} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Agent Config
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ Database & Maintenance ═════════════════════════════ */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                <Database className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <CardTitle>Database & Maintenance</CardTitle>
                <CardDescription>View record counts, export data, and manage storage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Record Counts */}
            {dbStats && (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <StatPill icon={CalendarDays} label="Appointments" count={dbStats.appointments} color="teal" />
                <StatPill icon={Mail} label="Emails" count={dbStats.emails} color="emerald" />
                <StatPill icon={Phone} label="Calls" count={dbStats.calls} color="amber" />
                <StatPill icon={FileText} label="Knowledge" count={dbStats.knowledge} color="rose" />
                <StatPill icon={Wrench} label="Integrations" count={dbStats.integrations} color="violet" />
                <StatPill icon={MessageSquare} label="Chat Msgs" count={dbStats.chatMessages} color="cyan" />
              </div>
            )}

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Total records in database: <strong className="text-foreground">{totalRecords}</strong>
            </div>

            <Separator />

            {/* Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Export All Data</p>
                <p className="text-xs text-muted-foreground">Download all business data as a JSON file for backup or migration</p>
              </div>
              <Button variant="outline" onClick={exportData} className="w-fit">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
            </div>

            <Separator />

            {/* Clear individual data types */}
            <div>
              <p className="font-medium text-sm mb-3">Clear Data by Type</p>
              <div className="flex flex-wrap gap-2">
                <ClearButton label="Appointments" type="appointments" onClear={clearDataType} loading={isClearing === 'appointments'} />
                <ClearButton label="Emails" type="emails" onClear={clearDataType} loading={isClearing === 'emails'} />
                <ClearButton label="Calls" type="calls" onClear={clearDataType} loading={isClearing === 'calls'} />
                <ClearButton label="Knowledge" type="knowledge" onClear={clearDataType} loading={isClearing === 'knowledge'} />
                <ClearButton label="Chat History" type="chat" onClear={clearDataType} loading={isClearing === 'chat'} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ System Info ════════════════════════════════════════ */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current deployment and configuration details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Framework" value="Next.js 16 (App Router)" />
              <InfoRow label="Runtime" value="Bun" />
              <InfoRow label="Database" value="SQLite via Prisma ORM" />
              <InfoRow label="Upload Limit" value="900 KB" />
              <InfoRow label="UI Library" value="shadcn/ui + Tailwind CSS 4" />
              <InfoRow label="Agent SDK" value="z-ai-web-dev-sdk" />
              {business.name && (
                <>
                  <InfoRow label="Active Business" value={business.name} />
                  <InfoRow label="Business Type" value={business.type || 'Not set'} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ Danger Zone ════════════════════════════════════════ */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-medium text-sm">Reset All Data</p>
                <p className="text-xs text-muted-foreground">Replace everything with fresh sample data (Sunshine Dental Clinic)</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 w-fit">
                    <RotateCcw className="h-4 w-4" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Reset All Data
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your current data and replace it with sample data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={resetAllData}
                      disabled={isResetting}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-medium text-sm">Delete Everything</p>
                <p className="text-xs text-muted-foreground">Permanently remove ALL data — appointments, emails, calls, knowledge, chat history, and integrations</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-400 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950 w-fit">
                    <Trash2 className="h-4 w-4" />
                    Delete Everything
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Delete ALL Data
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove every record from the database. You will need to re-configure the agent from scratch. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setIsClearing('everything')
                        try {
                          await Promise.all([
                            fetch('/api/appointments', { method: 'DELETE' }),
                            fetch('/api/emails', { method: 'DELETE' }),
                            fetch('/api/calls', { method: 'DELETE' }),
                            fetch('/api/knowledge', { method: 'DELETE' }),
                            fetch('/api/chat', { method: 'DELETE' }),
                          ])
                          const analyticsRes = await fetch('/api/analytics')
                          if (analyticsRes.ok) {
                            const a = await analyticsRes.json()
                            setDbStats({
                              appointments: a.summary.totalAppointments,
                              emails: a.summary.totalEmails,
                              calls: a.summary.totalCalls,
                              knowledge: a.summary.totalKnowledgeDocs,
                              integrations: a.summary.totalIntegrations,
                              chatMessages: a.summary.totalChats,
                            })
                          }
                        } catch { /* fail */ } finally {
                          setIsClearing(null)
                        }
                      }}
                      disabled={isClearing === 'everything'}
                      className="bg-red-700 text-white hover:bg-red-800"
                    >
                      {isClearing === 'everything' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
      <Icon className={`h-4 w-4 text-${color}-500`} />
      <div>
        <div className="text-sm font-bold">{count}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function ClearButton({ label, type, onClear, loading }: { label: string; type: string; onClear: (t: string) => void; loading: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Clear {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all {label.toLowerCase()}?</AlertDialogTitle>
          <AlertDialogDescription>This will permanently delete all {label.toLowerCase()} data.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClear(type)} className="bg-red-600 text-white hover:bg-red-700">
            Clear {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}