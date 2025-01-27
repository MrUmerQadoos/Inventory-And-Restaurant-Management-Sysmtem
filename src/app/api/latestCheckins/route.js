export const dynamic = 'force-dynamic'

// app/api/latestCheckins/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    let where = { status: 'PENDING' } // Filter by status if needed

    if (role === 'ADMIN' && startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (date) {
      where.createdAt = {
        gte: new Date(date),
        lte: new Date(date)
      }
    }

    if (role === 'RECEPTIONIST' && userId) {
      where.userId = userId
    }

    const checkins = await prisma.checkIn.findMany({
      where,
      include: {
        reservationRooms: {
          include: { room: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(checkins)
  } catch (error) {
    console.error('Error fetching check-ins:', error)
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 })
  }
}
