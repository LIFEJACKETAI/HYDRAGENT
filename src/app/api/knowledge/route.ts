import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const docs = await db.knowledgeDoc.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error('Failed to fetch knowledge docs:', error)
    return NextResponse.json({ error: 'Failed to fetch knowledge docs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const title = (formData.get('title') as string) ?? file?.name ?? 'Untitled Document'
      const source = (formData.get('source') as string) ?? 'upload'

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      const text = await file.text()
      const doc = await db.knowledgeDoc.create({
        data: {
          title,
          content: text,
          fileType: file.type || 'text/plain',
          fileSize: file.size,
          source,
          isActive: true,
        },
      })

      return NextResponse.json(doc, { status: 201 })
    }

    const body = await request.json()
    const { title, content, fileType, fileSize, source } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const doc = await db.knowledgeDoc.create({
      data: {
        title,
        content,
        fileType: fileType ?? 'text',
        fileSize: fileSize ?? 0,
        source: source ?? 'upload',
        isActive: true,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Failed to create knowledge doc:', error)
    return NextResponse.json({ error: 'Failed to create knowledge doc' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await db.knowledgeDoc.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete knowledge docs:', error)
    return NextResponse.json({ error: 'Failed to delete knowledge docs' }, { status: 500 })
  }
}