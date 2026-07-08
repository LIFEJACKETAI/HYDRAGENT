import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const doc = await db.knowledgeDoc.findUnique({ where: { id } })

    if (!doc) {
      return NextResponse.json({ error: 'Knowledge doc not found' }, { status: 404 })
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Failed to fetch knowledge doc:', error)
    return NextResponse.json({ error: 'Failed to fetch knowledge doc' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const doc = await db.knowledgeDoc.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Failed to update knowledge doc:', error)
    return NextResponse.json({ error: 'Failed to update knowledge doc' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.knowledgeDoc.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete knowledge doc:', error)
    return NextResponse.json({ error: 'Failed to delete knowledge doc' }, { status: 500 })
  }
}