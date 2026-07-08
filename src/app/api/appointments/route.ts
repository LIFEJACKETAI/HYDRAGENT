import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const appointments = await db.appointment.findMany({
      where: status ? { status } : undefined,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, service, date, duration, status, notes } = body

    if (!customerName || !service || !date) {
      return NextResponse.json(
        { error: 'customerName, service, and date are required' },
        { status: 400 }
      )
    }

    const appointment = await db.appointment.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        service,
        date: new Date(date),
        duration: duration ?? 30,
        status: status ?? 'scheduled',
        notes,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Failed to create appointment:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await db.appointment.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete appointments:', error)
    return NextResponse.json({ error: 'Failed to delete appointments' }, { status: 500 })
  }
}