import { db } from '@/libs/db/db'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const { status, pendingAmount, amountPaid, totalCost } = await req.json()

    const updatedCheckIn = await db.checkIn.update({
      where: { id },
      data: {
        status,
        pendingAmount,
        amountPaid,
        totalCost,
        updatedAt: new Date()
      },
      include: {
        reservationRooms: {
          include: { room: true }
        },
        minibarItems: true
      }
    })

    return NextResponse.json(updatedCheckIn)
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to checkout' }, { status: 500 })
  }
}
