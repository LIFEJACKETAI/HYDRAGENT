'use client'

import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Send, Trash2, BookOpen, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: string // 'user', 'assistant', 'system'
  content: string
  createdAt: string
}

interface KnowledgeDoc {
  id: string
  title: string
  content: string
  isActive: boolean
}

// ─── Animated Dots ───────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-teal-500"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[85%]"
      >
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm text-teal-800">
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <Avatar className="mb-0.5 h-7 w-7 shrink-0">
          <AvatarFallback className="bg-teal-600 text-white">
            <Droplets className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-teal-600 text-white'
            : 'rounded-bl-md bg-muted text-foreground'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChatPreviewView() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/chat')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data)
          } else {
            // Show welcome message if no history
            setMessages([
              {
                id: 'system-welcome',
                role: 'system',
                content:
                  "Hi! I'm your HYDRAGENT assistant. Ask me anything about this business!",
                createdAt: new Date().toISOString(),
              },
            ])
          }
        } else {
          setMessages([
            {
              id: 'system-welcome',
              role: 'system',
              content:
                "Hi! I'm your HYDRAGENT assistant. Ask me anything about this business!",
              createdAt: new Date().toISOString(),
            },
          ])
        }
      } catch {
        setMessages([
          {
            id: 'system-welcome',
            role: 'system',
            content:
              "Hi! I'm your HYDRAGENT assistant. Ask me anything about this business!",
            createdAt: new Date().toISOString(),
          },
        ])
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [])

  // Load active knowledge docs
  useEffect(() => {
    async function loadKnowledge() {
      try {
        const res = await fetch('/api/knowledge?isActive=true')
        if (res.ok) {
          const data = await res.json()
          setKnowledgeDocs(Array.isArray(data) ? data : [])
        }
      } catch {
        // Silently fail - knowledge panel will show empty state
      }
    }
    loadKnowledge()
  }, [])

  // Send message
  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMessage: ChatMessage = {
          id: data.id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content || data.message || 'Sorry, I could not process that.',
          createdAt: data.createdAt || new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  // Handle keyboard
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Clear chat
  function handleClearChat() {
    setMessages([
      {
        id: 'system-welcome',
        role: 'system',
        content: "Hi! I'm your HYDRAGENT assistant. Ask me anything about this business!",
        createdAt: new Date().toISOString(),
      },
    ])
  }

  const activeDocCount = knowledgeDocs.length

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* ─── Chat Interface (Left Panel) ─────────────────────────── */}
      <Card className="flex flex-1 flex-col overflow-hidden lg:w-[60%]">
        {/* Header */}
        <CardHeader className="shrink-0 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Agent Preview</CardTitle>
              <Badge variant="secondary" className="gap-1.5 bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <BookOpen className="h-3 w-3" />
                Using {activeDocCount} knowledge doc{activeDocCount !== 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-3">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-end gap-2"
                    >
                      <Avatar className="mb-0.5 h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-teal-600 text-white">
                          <Droplets className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl rounded-bl-md bg-muted px-2 py-1">
                        <LoadingDots />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="shrink-0 border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to send,{' '}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </Card>

      {/* ─── Knowledge Context Panel (Right Panel) ──────────────── */}
      <Card className="flex flex-col overflow-hidden lg:w-[40%]">
        <CardHeader className="shrink-0 border-b pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Active Knowledge</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {activeDocCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                <BookOpen className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No knowledge documents are active.
              </p>
              <p className="mt-1 max-w-[220px] text-xs text-muted-foreground/70">
                The agent will use general knowledge.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {knowledgeDocs.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="rounded-lg border bg-amber-50/50 p-3 dark:bg-amber-950/30">
                      <div className="mb-1.5 flex items-start gap-2">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 dark:bg-amber-900">
                          <FileText className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h4 className="text-sm font-medium leading-snug text-foreground">
                          {doc.title}
                        </h4>
                      </div>
                      <p className="line-clamp-3 pl-7 text-xs leading-relaxed text-muted-foreground">
                        {doc.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}