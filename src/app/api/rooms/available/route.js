import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// Floor mapping for string-to-enum conversion
const floorEnumMapping = {
  TOP_FLOOR: 'TOP_FLOOR',
  SECOND_FLOOR: 'SECOND_FLOOR',
  THIRD_FLOOR: 'THIRD_FLOOR',
  FOURTH_FLOOR: 'FOURTH_FLOOR',
  GROUND_FLOOR: 'GROUND_FLOOR'
}

// Fetch available rooms based on query parameters
export async function GET(req) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(req.url)
    let floor = searchParams.get('floor')
    const checkInDate = searchParams.get('checkInDate')
    const checkOutDate = searchParams.get('checkOutDate')

    console.log('Received floor:', floor)
    console.log('Received checkInDate:', checkInDate)
    console.log('Received checkOutDate:', checkOutDate)

    // Check if required parameters are provided
    if (!floor || !checkInDate || !checkOutDate) {
      console.error('Missing floor, checkInDate, or checkOutDate')
      return NextResponse.json({ error: 'Floor, Check-In, and Check-Out dates are required' }, { status: 400 })
    }

    // Ensure the floor is mapped correctly
    floor = floorEnumMapping[floor]
    if (!floor) {
      console.error('Invalid floor selection:', floor)
      return NextResponse.json({ error: 'Invalid floor selection' }, { status: 400 })
    }

    // Fetch rooms that are available within the date range
    const availableRooms = await db.room.findMany({
      where: { floor },
      include: {
        reservationRooms: {
          where: {
            OR: [
              {
                checkInDate: {
                  lte: new Date(checkOutDate) // Check rooms where check-out date is after or on the check-in date
                },
                checkOutDate: {
                  gte: new Date(checkInDate) // Check rooms where check-in date is before or on the check-out date
                }
              }
            ],
            reservation: {
              status: {
                in: ['CONFIRMED', 'PENDING'] // Only consider rooms with confirmed or pending reservations
              }
            }
          }
        }
      }
    })

    console.log('Fetched available rooms:', availableRooms)

    // Filter rooms based on availability (rooms without reservationRooms)
    const rooms = availableRooms.filter(room => room.reservationRooms.length === 0)

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching available rooms:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
