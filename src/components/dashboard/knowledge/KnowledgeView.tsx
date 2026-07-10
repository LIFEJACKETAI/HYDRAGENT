'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FileText,
  Trash2,
  Eye,
  Pencil,
  Upload,
  ClipboardPaste,
  FileUp,
  BookOpen,
  Globe,
  Plug,
  X,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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

interface KnowledgeDoc {
  id: string
  title: string
  content: string
  fileType: string
  fileSize: number
  source: string
  isActive: boolean
  createdAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

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

const sourceConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  'Manual Upload': { label: 'Manual', icon: Upload, className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  'Website Import': { label: 'Website', icon: Globe, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  'API Import': { label: 'API', icon: Plug, className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800' },
}

function fileExtensionColor(ext: string): string {
  switch (ext) {
    case 'pdf':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    case 'txt':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    case 'md':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'doc':
    case 'docx':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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

const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  hover: { scale: 1.005, boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)' },
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DocCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-5 w-12 animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </Card>
  )
}

// ─── Add Document Dialog ────────────────────────────────────────────────────

function AddDocumentDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('Manual Upload')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileType, setFileType] = useState('')
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setTitle('')
    setContent('')
    setSource('Manual Upload')
    setFileName('')
    setFileSize(0)
    setFileType('')
    setMode('paste')
    setDragOver(false)
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    setFileName(file.name)
    setFileSize(file.size)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    setFileType(ext)

    // Try to read text content for text-based files
    const textExts = ['txt', 'md']
    if (textExts.includes(ext)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
      }
      reader.readAsText(file)
    } else {
      // For non-text files, just store the filename
      setContent(`[Binary file: ${file.name}]`)
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
    }
  }, [title])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      let res
      if (mode === 'upload') {
        // For uploads, we must use FormData to send the actual file
        const formData = new FormData()
        formData.append('title', title.trim())
        formData.append('source', source)
        
        // Find the actual file from the input or state
        // Since we don't store the File object in state, we'll read from the ref
        const fileInput = fileInputRef.current
        const file = fileInput?.files?.[0]
        
        if (!file) {
          throw new Error('Please select a file to upload')
        }
        
        formData.append('file', file)

        res = await fetch('/api/knowledge', {
          method: 'POST',
          body: formData, // Browser automatically sets Content-Type to multipart/form-data
        })
      } else {
        // For pasted text, JSON is fine
        res = await fetch('/api/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content,
            fileType: 'txt',
            fileSize: new Blob([content]).size,
            source,
          }),
        })
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save document')
      }
      
      resetForm()
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      console.error('Failed to save document:', err)
      alert(err.message || 'An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Add Document
          </DialogTitle>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              mode === 'paste'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ClipboardPaste className="h-4 w-4" />
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              mode === 'upload'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileUp className="h-4 w-4" />
            Upload File
          </button>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input
            placeholder="Enter document title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content Area - Paste or Upload */}
        {mode === 'paste' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Content</label>
            <Textarea
              placeholder="Paste your document content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-y"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">File</label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragOver
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                  : fileName
                    ? 'border-teal-300 bg-teal-50/50 dark:border-teal-700 dark:bg-teal-950/20'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
              {fileName ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
                    <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatFileSize(fileSize)} · {fileType.toUpperCase()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFileName('')
                      setFileSize(0)
                      setFileType('')
                      setContent('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports .txt, .md, .pdf, .doc, .docx
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Source Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Source</label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual Upload">Manual Upload</SelectItem>
              <SelectItem value="Website Import">Website Import</SelectItem>
              <SelectItem value="API Import">API Import</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={saving}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── View Document Dialog ────────────────────────────────────────────────────

function ViewDocumentDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: KnowledgeDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!doc) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3 text-lg">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
              <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block truncate">{doc.title}</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${fileExtensionColor(doc.fileType)}`}
                >
                  {doc.fileType.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(doc.fileSize)}
                </span>
                {sourceConfig[doc.source] && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${sourceConfig[doc.source].className}`}
                  >
                    {sourceConfig[doc.source].label}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/30 p-4">
          <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground font-sans">
            {doc.content}
          </pre>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {relativeTime(doc.createdAt)}</span>
          <Badge
            variant="outline"
            className={doc.isActive ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800' : 'bg-muted text-muted-foreground border-border'}
          >
            {doc.isActive ? 'Active' : 'Inactive'}
          </Badge>
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

// ─── Edit Document Dialog ────────────────────────────────────────────────────

function EditDocumentDialog({
  doc,
  open,
  onOpenChange,
  onSaved,
}: {
  doc: KnowledgeDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (doc && open) {
      setTitle(doc.title)
      setContent(doc.content)
    }
  }, [doc, open])

  const handleSave = async () => {
    if (!doc || !title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/knowledge/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      })
      if (!res.ok) throw new Error('Failed to update document')
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to update document:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!doc) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Pencil className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Edit Document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[240px] resize-y"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={saving}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Document Card ───────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  doc: KnowledgeDoc
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const srcCfg = sourceConfig[doc.source]

  return (
    <motion.div variants={cardHover} initial="rest" whileHover="hover" transition={{ duration: 0.2 }}>
      <Card
        className="p-4 cursor-pointer transition-colors hover:border-teal-200 dark:hover:border-teal-800"
        onClick={onView}
      >
        <div className="space-y-3">
          {/* Top row: title + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{doc.title}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${fileExtensionColor(doc.fileType)}`}
                >
                  {doc.fileType.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatFileSize(doc.fileSize)}
                </span>
                {srcCfg && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${srcCfg.className}`}
                  >
                    <srcCfg.icon className="mr-0.5 h-2.5 w-2.5" />
                    {srcCfg.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
                aria-label="Edit document"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                onClick={onDelete}
                aria-label="Delete document"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Content preview */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {doc.content.length > 150 ? doc.content.slice(0, 150) + '...' : doc.content}
          </p>

          {/* Bottom row: date + toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {relativeTime(doc.createdAt)}
            </span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] text-muted-foreground">
                {doc.isActive ? 'Active' : 'Inactive'}
              </span>
              <Switch
                checked={doc.isActive}
                onCheckedChange={onToggleActive}
                aria-label="Toggle document active state"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/30">
          <BookOpen className="h-12 w-12 text-teal-500 dark:text-teal-400" />
        </div>
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground">No documents yet</h3>
      <p className="mt-1.5 text-sm text-muted-foreground text-center max-w-sm">
        Start building your knowledge base by adding your first document. You can paste text or upload files.
      </p>
      <Button
        onClick={onAdd}
        className="mt-6 bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Document
      </Button>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function KnowledgeView() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [viewDoc, setViewDoc] = useState<KnowledgeDoc | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/knowledge')
      if (!res.ok) throw new Error('Failed to fetch documents')
      const data: KnowledgeDoc[] = await res.json()
      setDocs(data)
    } catch (err) {
      console.error('Failed to fetch knowledge documents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleDelete = async (doc: KnowledgeDoc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
      return
    }
    try {
      const res = await fetch(`/api/knowledge/${doc.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete document')
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const handleToggleActive = async (doc: KnowledgeDoc) => {
    try {
      const res = await fetch(`/api/knowledge/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !doc.isActive }),
      })
      if (!res.ok) throw new Error('Failed to toggle document')
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isActive: !d.isActive } : d))
      )
    } catch (err) {
      console.error('Failed to toggle document active state:', err)
    }
  }

  const handleView = (doc: KnowledgeDoc) => {
    setViewDoc(doc)
    setViewDialogOpen(true)
  }

  const handleEdit = (doc: KnowledgeDoc) => {
    setEditDoc(doc)
    setEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage documents that power your AI assistant&apos;s knowledge.
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </motion.div>

      {/* Document List / Empty State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DocCardSkeleton key={i} />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState onAdd={() => setAddDialogOpen(true)} />
      ) : (
        <>
          {/* Summary bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center gap-4 text-sm text-muted-foreground"
          >
            <span>
              <span className="font-semibold text-foreground">{docs.length}</span> document{docs.length !== 1 ? 's' : ''} total
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {docs.filter((d) => d.isActive).length}
              </span>{' '}
              active
            </span>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {docs.map((doc) => (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <DocumentCard
                    doc={doc}
                    onView={() => handleView(doc)}
                    onEdit={() => handleEdit(doc)}
                    onDelete={() => handleDelete(doc)}
                    onToggleActive={() => handleToggleActive(doc)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* Dialogs */}
      <AddDocumentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSaved={fetchDocs}
      />

      <ViewDocumentDialog
        doc={viewDoc}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditDocumentDialog
        doc={editDoc}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSaved={fetchDocs}
      />
    </div>
  )
}