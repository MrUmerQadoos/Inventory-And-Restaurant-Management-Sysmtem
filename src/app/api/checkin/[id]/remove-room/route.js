import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust this path based on your project structure
import { ObjectId } from 'bson'

// DELETE: Remove a specific room reservation from ReservationRoom by its `roomId`
export async function DELETE(req, { params }) {
  try {
    const { roomId } = await req.json() // Get the `roomId` from the request body

    // Validate the `roomId`
    if (!roomId || !ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: 'Invalid Room ID' }, { status: 400 })
    }

    // Delete the room reservation from the ReservationRoom model using `roomId`
    const deletedRoom = await db.reservationRoom.deleteMany({
      where: { roomId: roomId } // Delete all matching reservations with the given `roomId`
    })

    // Check if any records were deleted
    if (deletedRoom.count === 0) {
      return NextResponse.json({ error: 'Room not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Room deleted successfully', deletedRoom }, { status: 200 })
  } catch (error) {
    console.error('Error deleting room from reservation:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
