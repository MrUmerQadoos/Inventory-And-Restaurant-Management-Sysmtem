import { db } from '@/libs/db/db'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const guestName = searchParams.get('name')

  if (!guestName) {
    return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
  }

  try {
    // Fetch the guest's check-ins and associated rooms
    const guestCheckInRooms = await db.checkIn.findMany({
      where: { guestName: guestName },
      include: {
        reservationRooms: {
          include: {
            room: true // Include room details
          }
        }
      }
    })

    // Transform the response to extract room data
    const rooms = guestCheckInRooms.flatMap(checkIn =>
      checkIn.reservationRooms.map(reservationRoom => ({
        roomId: reservationRoom.room.id,
        roomName: reservationRoom.room.roomName,
        roomType: reservationRoom.room.roomType,
        checkInId: checkIn.id
      }))
    )

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching guest rooms:', error)
    return NextResponse.json({ error: 'Error fetching guest rooms' }, { status: 500 })
  }
}
