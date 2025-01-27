import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET: Fetch all rooms
export async function GET() {
  try {
    const rooms = await db.room.findMany()
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST: Create a new room

// Floor mapping for string-to-enum conversion
const floorEnumMapping = {
  'Top Floor': 'TOP_FLOOR',
  'Second Floor': 'SECOND_FLOOR',
  'Third Floor': 'THIRD_FLOOR',
  'Fourth Floor': 'FOURTH_FLOOR',
  'Ground Floor': 'GROUND_FLOOR'
}

// POST: Create or search available rooms by floor
export async function POST(req) {
  try {
    const body = await req.json()
    let { floor, roomName, roomType, roomView, roomPrice } = body

    // Validate floor input
    if (!floor) {
      return NextResponse.json({ error: 'Floor is required' }, { status: 400 })
    }

    // Convert floor to Prisma enum value
    floor = floorEnumMapping[floor]
    if (!floor) {
      return NextResponse.json({ error: 'Invalid floor selection' }, { status: 400 })
    }

    // Create a new room if room details are provided
    if (roomName && roomType && roomView && roomPrice) {
      const newRoom = await db.room.create({
        data: {
          floor, // Prisma will map the correct enum value
          roomName,
          roomType,
          roomView,
          roomPrice: parseFloat(roomPrice) // Ensure roomPrice is a float
        }
      })
      return NextResponse.json(newRoom, { status: 201 })
    }

    // If no room details provided, search for available rooms on the specified floor
    const rooms = await db.room.findMany({
      where: { floor }
    })

    return NextResponse.json(rooms, { status: 200 })
  } catch (error) {
    console.error('Error handling room request:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE: Delete a specific room by ID
export async function DELETE(req) {
  const id = req.nextUrl.pathname.split('/').pop()

  try {
    const deletedRoom = await db.room.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Room deleted successfully', deletedRoom })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
