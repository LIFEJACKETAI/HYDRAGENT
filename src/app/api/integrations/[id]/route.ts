import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const integration = await db.integration.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.config !== undefined && {
          config: typeof body.config === 'object' ? JSON.stringify(body.config) : body.config,
        }),
        ...(body.lastSyncAt !== undefined && { lastSyncAt: new Date(body.lastSyncAt) }),
      },
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Failed to update integration:', error)
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.integration.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete integration:', error)
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 })
  }
}