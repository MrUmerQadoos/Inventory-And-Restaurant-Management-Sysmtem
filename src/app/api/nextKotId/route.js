// app/api/nextKotId/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
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

    // If no orders exist, start from 1000, otherwise increment the latest kotId
    const nextKotId = latestOrder ? (parseInt(latestOrder.kotId) + 1).toString() : '1000'

    return NextResponse.json({ nextKotId })
  } catch (error) {
    console.error('Error generating next KOT ID:', error)
    return NextResponse.json({ error: 'Failed to generate next KOT ID' }, { status: 500 })
  }
}
