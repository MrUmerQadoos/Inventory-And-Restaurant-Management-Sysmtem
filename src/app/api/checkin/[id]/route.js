import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust this path based on your project structure
import { ObjectId } from 'bson'

// GET: Fetch a specific check-in by ID

export async function GET(req, { params }) {
  try {
    const { id } = params

    // Validate the check-in ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid check-in ID' }, { status: 400 })
    }

    // Fetch the check-in details with all related data
    const checkIn = await db.checkIn.findUnique({
      where: { id: new ObjectId(id) },
      include: {
        reservationRooms: {
          include: {
            room: true
          }
        },
        user: true,
        minibarItems: true, // Include minibar items
        paymentDetails: {
          // Include payment details
          include: {
            bill: {
              // Include related bills
              include: {
                order: {
                  // Include order details for bills
                  include: {
                    items: true // Include order items
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
    }

    // Calculate totals
    const roomTotal = checkIn.reservationRooms.reduce((sum, room) => sum + room.cost, 0)
    const minibarTotal = checkIn.minibarItems.reduce((sum, item) => sum + item.price, 0)
    const restaurantTotal = checkIn.paymentDetails.reduce((sum, payment) => {
      if (payment.bill) {
        return sum + payment.bill.netAmount
      }
      return sum
    }, 0)

    // Add calculated totals to response
    const response = {
      ...checkIn,
      calculatedTotals: {
        roomTotal,
        minibarTotal,
        restaurantTotal,
        grandTotal: roomTotal + minibarTotal + restaurantTotal
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching check-in:', error)
    return NextResponse.json(
      {
        error: 'Something went wrong',
        details: error.message
      },
      { status: 500 }
    )
  }
}
// PUT: Update a specific check-in by ID

export async function PUT(req, { params }) {
  try {
    const { id } = params
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
      totalCost,
      minibarItems // Add this to receive minibar items
    } = body

    // Validate required fields
    if (!guestName || !guestContact || !rooms || rooms.length === 0 || !userId) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // Validate the check-in ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid check-in ID' }, { status: 400 })
    }

    // Calculate room total
    const roomPrice = rooms.reduce((total, room) => total + room.cost, 0)

    // Calculate minibar total
    const minibarTotal = minibarItems ? minibarItems.reduce((total, item) => total + item.price, 0) : 0

    // Update the Check-In details
    const updatedCheckIn = await db.checkIn.update({
      where: { id: new ObjectId(id) },
      data: {
        guestName,
        guestContact,
        email,
        cnic,
        paymentMethod,
        roomPrice,
        children: children ? parseInt(children) : null,
        guests: guests ? parseInt(guests) : 1,
        address,
        city,
        country,
        company,
        userId,
        amountPaid,
        pendingAmount,
        totalCost, // Update total cost with minibar

        // Update rooms
        reservationRooms: {
          deleteMany: {}, // Delete existing reservationRooms
          create: rooms.map(room => ({
            roomId: room.roomId,
            checkInDate: new Date(room.checkInDate),
            checkOutDate: new Date(room.checkOutDate),
            nights: room.nights,
            cost: room.cost
          }))
        },

        // Add minibar items if they exist
        minibarItems: minibarItems
          ? {
              deleteMany: {}, // Delete existing minibar items
              create: minibarItems.map(item => ({
                name: item.name,
                price: item.price
              }))
            }
          : undefined
      },
      include: {
        reservationRooms: {
          include: { room: true }
        },
        user: true,
        minibarItems: true // Include minibar items in response
      }
    })

    return NextResponse.json(updatedCheckIn, { status: 200 })
  } catch (error) {
    console.error('Error updating check-in:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
// DELETE: Remove a specific check-in by ID
export async function DELETE(req, { params }) {
  try {
    const { id } = params

    // Validate the check-in ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid check-in ID' }, { status: 400 })
    }

    // Delete the check-in
    const deletedCheckIn = await db.checkIn.delete({
      where: { id: new ObjectId(id) }
    })

    if (!deletedCheckIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Check-in deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting check-in:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
