import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        ...(body.customerName !== undefined && { customerName: body.customerName }),
        ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
        ...(body.customerPhone !== undefined && { customerPhone: body.customerPhone }),
        ...(body.service !== undefined && { service: body.service }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Failed to update appointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.appointment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete appointment:', error)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}