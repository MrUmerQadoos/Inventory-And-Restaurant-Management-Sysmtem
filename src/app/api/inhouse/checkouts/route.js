import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function GET() {
  try {
    // Define today's start and end timestamps
    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    const endOfToday = new Date(today.setHours(23, 59, 59, 999))

    console.log('Start of Today:', startOfToday)
    console.log('End of Today:', endOfToday)

    const checkOuts = await db.checkIn.findMany({
      where: {
        status: 'PENDING',
        reservationRooms: {
          some: {
            checkOutDate: {
              gte: startOfToday,
              lte: endOfToday
            }
          }
        }
      },
      include: {
        reservationRooms: {
          include: { room: true }
        },
        user: true
      }
    })

    console.log('Fetched checkOuts:', checkOuts)
    return NextResponse.json(checkOuts, { status: 200 })
  } catch (error) {
    console.error('Error fetching check-outs:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
