import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust this path based on your project structure
import { ObjectId } from 'bson'

export async function GET(req) {
  try {
    // Fetch all check-ins with related reservationRooms and user details
    const checkIns = await db.checkIn.findMany({
      where: {
        status: 'PENDING' // Only fetch PENDING status
      },
      include: {
        reservationRooms: {
          include: { room: true } // Include related room data in reservationRooms
        },
        user: true // Include user details
      }
    })

    // Return the fetched data as JSON
    return NextResponse.json(checkIns, { status: 200 })
  } catch (error) {
    console.error('Error fetching check-ins:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      guestName,
      guestContact,
      email,
      cnic,
      paymentMethod,
      children,
      guests,
      address,
      city,
      country,
      company,
      rooms,
      userId,
      amountPaid,
      pendingAmount,
      totalCost
    } = body

    // Validate required fields
    if (!guestName || !guestContact || !rooms || rooms.length === 0 || !userId) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // Check if userId is a valid ObjectID
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid userId. Must be a valid ObjectID.' }, { status: 400 })
    }

    // Calculate total roomPrice
    const roomPrice = rooms.reduce((total, room) => total + room.cost, 0)

    // Create the new Check-In with initial status and lowercase guest name
    const newCheckIn = await db.checkIn.create({
      data: {
        status: 'PENDING', // Set initial status to PENDING
        guestName: guestName.toLowerCase(), // Convert guest name to lowercase
        guestContact,
        email: email?.toLowerCase(), // Also convert email to lowercase if provided
        cnic,
        paymentMethod,
        roomPrice,
        children: children ? parseInt(children) : null,
        guests: guests ? parseInt(guests) : 1,
        address,
        city: city?.toLowerCase(), // Convert city to lowercase
        country: country?.toLowerCase(), // Convert country to lowercase
        company: company?.toLowerCase(), // Convert company to lowercase
        userId,
        amountPaid,
        pendingAmount,
        totalCost,

        // Handle the rooms data
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

    return NextResponse.json(newCheckIn, { status: 200 })
  } catch (error) {
    console.error('Error creating check-in:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
