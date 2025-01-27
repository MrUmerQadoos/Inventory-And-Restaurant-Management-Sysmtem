// app/api/latestKotId/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Find the order with the highest kotId
    const latestOrder = await prisma.order.findFirst({
      orderBy: {
        kotId: 'desc'
      },
      select: {
        kotId: true
      }
    })

    // If no orders exist, return 999 (so the next ID will be 1000)
    const latestKotId = latestOrder ? parseInt(latestOrder.kotId) : 999

    return NextResponse.json({ latestKotId })
  } catch (error) {
    console.error('Error fetching latest KOT ID:', error)
    return NextResponse.json({ error: 'Failed to fetch latest KOT ID' }, { status: 500 })
  }
}
