import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust this path based on your project structure

// Fetch a specific room by ID
export async function GET(req) {
  try {
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const room = await db.room.findUnique({ where: { id } })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// Update a specific room by ID
export async function PUT(req) {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    const body = await req.json()
    const { floor, roomName, roomType, roomView, roomPrice } = body

    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if the room exists
    const existingRoom = await db.room.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Update the room
    const updatedRoom = await db.room.update({
      where: { id },
      data: {
        floor,
        roomName,
        roomType,
        roomView,
        roomPrice: parseFloat(roomPrice)
      }
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// Delete a specific room by ID
export async function DELETE(req) {
  try {
    const id = req.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if the room exists
    const existingRoom = await db.room.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Delete the room
    const deletedRoom = await db.room.delete({ where: { id } })

    return NextResponse.json(deletedRoom)
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
