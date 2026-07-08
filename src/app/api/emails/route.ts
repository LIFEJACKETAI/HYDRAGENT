import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction')

    const emails = await db.emailRecord.findMany({
      where: direction ? { direction } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(emails)
  } catch (error) {
    console.error('Failed to fetch emails:', error)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to, subject, body: emailBody, direction, status, appointmentId } = body

    if (!from || !to || !subject) {
      return NextResponse.json(
        { error: 'from, to, and subject are required' },
        { status: 400 }
      )
    }

    const email = await db.emailRecord.create({
      data: {
        from,
        to,
        subject,
        body: emailBody ?? '',
        direction: direction ?? 'outbound',
        status: status ?? 'sent',
        appointmentId,
      },
    })

    return NextResponse.json(email, { status: 201 })
  } catch (error) {
    console.error('Failed to create email:', error)
    return NextResponse.json({ error: 'Failed to create email' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await db.emailRecord.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete emails:', error)
    return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 })
  }
}