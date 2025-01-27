import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// Floor mapping for string-to-enum conversion
const floorEnumMapping = {
  'Top Floor': 'TOP_FLOOR',
  'Second Floor': 'SECOND_FLOOR',
  'Third Floor': 'THIRD_FLOOR',
  'Fourth Floor': 'FOURTH_FLOOR',
  'Ground Floor': 'GROUND_FLOOR'
}

// Search available rooms by floor
export async function POST(req) {
  try {
    const body = await req.json()
    let { floor } = body

    if (!floor) {
      return NextResponse.json({ error: 'Floor is required' }, { status: 400 })
    }

    // Convert floor to Prisma enum value
    floor = floorEnumMapping[floor]
    if (!floor) {
      return NextResponse.json({ error: 'Invalid floor selection' }, { status: 400 })
    }

    // Fetch rooms with specific floor and check if they are reserved or not
    const availableRooms = await db.room.findMany({
      where: { floor },
      include: {
        reservationRooms: {
          where: {
            reservation: {
              status: {
                in: ['CONFIRMED', 'PENDING']
              }
            }
          },
          select: { id: true }
        }
      }
    })

    // Filter rooms based on whether they are available or not
    const rooms = availableRooms.filter(room => room.reservationRooms.length === 0)

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching available rooms:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
