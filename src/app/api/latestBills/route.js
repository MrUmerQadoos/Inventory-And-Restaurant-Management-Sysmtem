export const dynamic = 'force-dynamic'

// app/api/latestBills/route.js

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req) {
  try {
    // Use URL for extracting search params
    const url = new URL(req.url)
    const searchParams = url.searchParams
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    let where = {}

    if (role === 'ADMIN' && startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      where.createdAt = {
        gte: start,
        lte: end
      }
    } else if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    if (role === 'RECEPTIONIST' && userId) {
      where.userId = userId
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        user: true,
        order: {
          include: {
            items: {
              include: {
                item: true
              }
            }
          }
        },
        paymentDetails: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bills)
  } catch (error) {
    console.error('Error fetching latest bills:', error)
    return NextResponse.json({ error: 'Failed to fetch latest bills' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
