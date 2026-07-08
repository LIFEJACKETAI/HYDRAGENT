import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET() {
  try {
    const messages = await db.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        role: 'user',
        content: message,
      },
    })

    // Fetch all active knowledge docs for context
    const knowledgeDocs = await db.knowledgeDoc.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    const knowledgeContext = knowledgeDocs
      .map((doc) => `--- ${doc.title} ---\n${doc.content}`)
      .join('\n\n')

    // Fetch recent chat history (last 20 messages)
    const historyMessages = await db.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    const chatHistory = historyMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    // Call LLM via z-ai-web-dev-sdk
    const zai = await ZAI.create()
    const result = await zai.chat.completions.create({
      model: 'default',
      messages: [
        {
          role: 'system',
          content: `You are HYDRAGENT, an AI appointment assistant for a business. You help customers book appointments, answer questions about services, and provide helpful information. Be friendly, professional, and concise. Here is the business knowledge:\n\n${knowledgeContext || 'No knowledge base documents available yet.'}`,
        },
        ...chatHistory,
      ],
    })

    const assistantMessage =
      result.choices?.[0]?.message?.content ?? 'Sorry, I was unable to generate a response.'

    // Save assistant message
    await db.chatMessage.create({
      data: {
        role: 'assistant',
        content: assistantMessage,
      },
    })

    return NextResponse.json({ response: assistantMessage })
  } catch (error) {
    console.error('Failed to process chat:', error)
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await db.chatMessage.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete chat messages:', error)
    return NextResponse.json({ error: 'Failed to delete chat messages' }, { status: 500 })
  }
}