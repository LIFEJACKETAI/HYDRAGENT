import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const business = await db.business.findFirst()
    return NextResponse.json(business ?? null)
  } catch (error) {
    console.error('Failed to fetch business:', error)
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const existing = await db.business.findFirst()

    let business
    if (existing) {
      business = await db.business.update({
        where: { id: existing.id },
        data: {
          name: body.name,
          type: body.type,
          description: body.description,
          address: body.address,
          phone: body.phone,
          email: body.email,
          website: body.website,
          hours: body.hours,
          logoUrl: body.logoUrl,
          primaryColor: body.primaryColor,
          accentColor: body.accentColor,
          widgetPosition: body.widgetPosition,
          widgetGreeting: body.widgetGreeting,
        },
      })
    } else {
      business = await db.business.create({
        data: {
          name: body.name,
          type: body.type,
          description: body.description,
          address: body.address,
          phone: body.phone,
          email: body.email,
          website: body.website,
          hours: body.hours,
          logoUrl: body.logoUrl,
          primaryColor: body.primaryColor,
          accentColor: body.accentColor,
          widgetPosition: body.widgetPosition,
          widgetGreeting: body.widgetGreeting,
        },
      })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error('Failed to update business:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}