import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const calls = await db.callLog.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(calls)
  } catch (error) {
    console.error('Failed to fetch call logs:', error)
    return NextResponse.json({ error: 'Failed to fetch call logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, direction, duration, status, notes, recordingUrl } = body

    if (!customerPhone) {
      return NextResponse.json({ error: 'customerPhone is required' }, { status: 400 })
    }

    const call = await db.callLog.create({
      data: {
        customerName,
        customerPhone,
        direction: direction ?? 'inbound',
        duration,
        status: status ?? 'completed',
        notes,
        recordingUrl,
      },
    })

    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    console.error('Failed to create call log:', error)
    return NextResponse.json({ error: 'Failed to create call log' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await db.callLog.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete calls:', error)
    return NextResponse.json({ error: 'Failed to delete calls' }, { status: 500 })
  }
}