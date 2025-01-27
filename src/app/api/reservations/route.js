import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET: Fetch all reservations
export async function GET() {
  try {
    const reservations = await db.reservation.findMany({
      include: {
        reservationRooms: {
          include: { room: true }
        },
        user: true
      }
    })
    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST: Create a new reservation
// POST: Create a new reservation
export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, guestName, guestContact, rooms, status, note } = body

    // Validate required fields
    if (!userId || !guestName || !guestContact || !rooms || rooms.length === 0 || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Create the new reservation
    const newReservation = await db.reservation.create({
      data: {
        userId,
        guestName,
        guestContact,
        status,
        note,

        reservationRooms: {
          create: rooms.map(room => ({
            roomId: room.roomId,
            checkInDate: new Date(room.checkInDate),
            checkOutDate: new Date(room.checkOutDate),
            nights: room.nights,
            cost: room.cost
          }))
        }
      },
      include: {
        reservationRooms: {
          include: { room: true }
        },
        user: true
      }
    })

    return NextResponse.json(newReservation)
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
