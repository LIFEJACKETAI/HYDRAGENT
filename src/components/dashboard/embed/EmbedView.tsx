'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Copy,
  Check,
  Save,
  Palette,
  Settings,
  Building2,
  Code2,
  Loader2,
  X,
  Send,
  Bot,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Business {
  id: string
  name: string
  type: string
  phone: string | null
  email: string | null
  primaryColor: string
  accentColor: string
  widgetPosition: string
  widgetGreeting: string
  [key: string]: unknown
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// ─── Widget Preview ──────────────────────────────────────────────────────────

function WidgetPreview({
  primaryColor,
  accentColor,
  greeting,
  position,
}: {
  primaryColor: string
  accentColor: string
  greeting: string
  position: string
}) {
  const [widgetOpen, setWidgetOpen] = useState(false)

  const isBottomRight = position === 'bottom-right'

  return (
    <div className="relative w-full h-[380px] rounded-lg border border-border bg-background overflow-hidden">
      {/* Fake website content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg"
            style={{ backgroundColor: primaryColor }}
          />
          <div>
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-2.5 w-20 rounded bg-muted mt-1.5" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
          <div className="h-3 w-4/6 rounded bg-muted" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-24 rounded-md bg-muted" />
          <div className="h-8 w-24 rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-20 rounded-lg bg-muted" />
          <div className="h-20 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Widget */}
      <div
        className={`absolute ${isBottomRight ? 'bottom-4 right-4' : 'bottom-4 left-4'}`}
      >
        {/* Chat Window */}
        {widgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-3 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          >
            {/* Chat Header */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Chat Assistant</span>
              </div>
              <button
                onClick={() => setWidgetOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-3 space-y-2.5 max-h-[180px] overflow-y-auto">
              {/* Bot greeting */}
              <div className="flex gap-2">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  H
                </div>
                <div className="rounded-lg bg-muted px-3 py-1.5 max-w-[200px]">
                  <p className="text-xs text-foreground leading-relaxed">{greeting}</p>
                </div>
              </div>

              {/* User message */}
              <div className="flex gap-2 justify-end">
                <div
                  className="rounded-lg px-3 py-1.5 max-w-[200px]"
                  style={{ backgroundColor: accentColor, color: '#fff' }}
                >
                  <p className="text-xs leading-relaxed">I'd like to book an appointment</p>
                </div>
              </div>

              {/* Bot reply */}
              <div className="flex gap-2">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  H
                </div>
                <div className="rounded-lg bg-muted px-3 py-1.5 max-w-[200px]">
                  <p className="text-xs text-foreground leading-relaxed">
                    I'd be happy to help! What day works best for you?
                  </p>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-border p-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5">
                <span className="text-xs text-muted-foreground flex-1">Type a message...</span>
                <Send
                  className="h-3.5 w-3.5 text-muted-foreground"
                  style={{ color: primaryColor }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWidgetOpen(!widgetOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageSquare className="h-5 w-5 text-white" />
        </motion.button>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EmbedView() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // ─── Form State ───────────────────────────────────────────────────────────

  const [widgetPosition, setWidgetPosition] = useState('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#0d9488')
  const [accentColor, setAccentColor] = useState('#f59e0b')
  const [greeting, setGreeting] = useState('Hi! How can I help you today?')
  const [autoOpen, setAutoOpen] = useState('never')
  const [collectName, setCollectName] = useState(false)
  const [collectEmail, setCollectEmail] = useState(false)

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/business')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (data) {
        setBusiness(data)
        setWidgetPosition(data.widgetPosition || 'bottom-right')
        setPrimaryColor(data.primaryColor || '#0d9488')
        setAccentColor(data.accentColor || '#f59e0b')
        setGreeting(data.widgetGreeting || 'Hi! How can I help you today?')
      }
    } catch (err) {
      console.error('Failed to fetch business:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBusiness()
  }, [fetchBusiness])

  // ─── Save Configuration ───────────────────────────────────────────────────

  const handleSave = async () => {
    if (!business) return
    try {
      setSaving(true)
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...business,
          widgetPosition,
          primaryColor,
          accentColor,
          widgetGreeting: greeting,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated = await res.json()
      setBusiness(updated)
      toast({
        title: 'Configuration saved',
        description: 'Your widget settings have been updated.',
      })
    } catch (err) {
      console.error('Failed to save configuration:', err)
      toast({
        title: 'Save failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // ─── Copy Embed Code ──────────────────────────────────────────────────────

  const handleCopy = async () => {
    const code = `<script src="https://cdn.hydragent.ai/widget.js" data-id="${business?.id || 'YOUR_BUSINESS_ID'}"></script>`
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Embed code copied to clipboard.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      })
    }
  }

  // ─── Embed Code ───────────────────────────────────────────────────────────

  const embedCode = `<script src="https://cdn.hydragent.ai/widget.js" data-id="${business?.id || 'YOUR_BUSINESS_ID'}"></script>`

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="space-y-6" aria-label="Embed widget configuration">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Embed Widget
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and preview your chat widget, then embed it on your website.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Left Column: Preview + Embed Code ────────────────────────────── */}
        <motion.div variants={staggerItem} className="space-y-6">
          {/* Widget Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
                  <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Widget Preview
              </CardTitle>
              <CardDescription>
                See how your chat widget will appear on your website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[380px] w-full animate-pulse rounded-lg bg-muted" />
              ) : (
                <WidgetPreview
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  greeting={greeting}
                  position={widgetPosition}
                />
              )}
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
                  <Code2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Embed Code
              </CardTitle>
              <CardDescription>
                Add this snippet to your website&apos;s HTML before the closing{' '}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="text-sm font-mono text-foreground leading-relaxed break-all whitespace-pre-wrap">
                    {embedCode}
                  </code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="absolute top-2 right-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right Column: Configuration ──────────────────────────────────── */}
        <motion.div variants={staggerItem} className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
                  <Palette className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widget-position">Widget Position</Label>
                <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                  <SelectTrigger id="widget-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-md border border-border"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-md border border-border"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting Message</Label>
                <Textarea
                  id="greeting"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Hi! How can I help you today?"
                  className="min-h-[80px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
                  <Settings className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-open">Auto-open after</Label>
                <Select value={autoOpen} onValueChange={setAutoOpen}>
                  <SelectTrigger id="auto-open">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collect-name">Collect visitor name</Label>
                  <p className="text-xs text-muted-foreground">
                    Ask visitors for their name before chatting
                  </p>
                </div>
                <Switch
                  id="collect-name"
                  checked={collectName}
                  onCheckedChange={setCollectName}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collect-email">Collect visitor email</Label>
                  <p className="text-xs text-muted-foreground">
                    Ask visitors for their email before chatting
                  </p>
                </div>
                <Switch
                  id="collect-email"
                  checked={collectEmail}
                  onCheckedChange={setCollectEmail}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Info (read-only) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
                  <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Business Info
              </CardTitle>
              <CardDescription>
                Information associated with your embed widget.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : business ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                      Name
                    </span>
                    <span className="text-sm text-foreground">{business.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                      Type
                    </span>
                    <span className="text-sm text-foreground capitalize">{business.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                      Phone
                    </span>
                    <span className="text-sm text-foreground">{business.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                      Email
                    </span>
                    <span className="text-sm text-foreground">{business.email || '—'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No business data found.</p>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <motion.div variants={fadeInUp}>
            <Button
              onClick={handleSave}
              disabled={saving || !business}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}