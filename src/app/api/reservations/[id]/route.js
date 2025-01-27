import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET: Fetch a specific reservation by ID
// GET: Fetch a specific reservation by ID
export async function GET(req) {
  const id = req.nextUrl.pathname.split('/').pop()

  try {
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        reservationRooms: {
          // Include the room details via reservationRooms
          include: { room: true }
        },
        user: true // Include user details
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT: Update a specific reservation by ID
// PUT: Update a specific reservation by ID
export async function PUT(req) {
  const id = req.nextUrl.pathname.split('/').pop()
  const body = await req.json()

  try {
    // If checkInDate or checkOutDate exist in the request, convert them to Date objects
    if (body.rooms) {
      body.rooms = body.rooms.map(room => ({
        ...room,
        checkInDate: new Date(room.checkInDate),
        checkOutDate: new Date(room.checkOutDate)
      }))
    }

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: {
        guestName: body.guestName,
        guestContact: body.guestContact,
        status: body.status,
        note: body.note,
        reservationRooms: {
          deleteMany: {}, // Delete old reservationRooms
          create: body.rooms.map(room => ({
            roomId: room.roomId,
            checkInDate: room.checkInDate,
            checkOutDate: room.checkOutDate,
            nights: room.nights,
            cost: room.cost
          }))
        }
      },
      include: {
        reservationRooms: {
          include: { room: true } // Include the updated room details
        },
        user: true // Include user details
      }
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE: Delete a specific reservation by ID
export async function DELETE(req) {
  const id = req.nextUrl.pathname.split('/').pop()

  try {
    // Delete the reservation and its associated reservationRooms
    const deletedReservation = await db.reservation.delete({
      where: { id },
      include: {
        reservationRooms: true // Ensure related reservationRooms are deleted
      }
    })

    return NextResponse.json({ message: 'Reservation deleted successfully', deletedReservation })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
