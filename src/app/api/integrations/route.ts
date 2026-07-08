import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const integrations = await db.integration.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(integrations)
  } catch (error) {
    console.error('Failed to fetch integrations:', error)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, status, config, lastSyncAt } = body

    if (!type || !name) {
      return NextResponse.json(
        { error: 'type and name are required' },
        { status: 400 }
      )
    }

    // Check if an integration of this type already exists
    const existing = await db.integration.findFirst({ where: { type } })

    let integration
    if (existing) {
      integration = await db.integration.update({
        where: { id: existing.id },
        data: {
          name,
          ...(status !== undefined && { status }),
          ...(config !== undefined && { config: typeof config === 'object' ? JSON.stringify(config) : config }),
          ...(lastSyncAt !== undefined && { lastSyncAt: new Date(lastSyncAt) }),
        },
      })
    } else {
      integration = await db.integration.create({
        data: {
          type,
          name,
          status: status ?? 'disconnected',
          config: config ? (typeof config === 'object' ? JSON.stringify(config) : config) : null,
          lastSyncAt: lastSyncAt ? new Date(lastSyncAt) : null,
        },
      })
    }

    return NextResponse.json(integration, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Failed to create/update integration:', error)
    return NextResponse.json({ error: 'Failed to create/update integration' }, { status: 500 })
  }
}