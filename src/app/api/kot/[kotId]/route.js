// app/api/kot/[kotId]/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req, { params }) {
  try {
    const { kotId } = params
    const kotData = await req.json()

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { kotId: kotId },
      data: {
        totalAmount: kotData.totalAmount,
        waiterName: kotData.waiterName,
        tableNumber: kotData.tableNumber,
        floor: kotData.floor,
        items: {
          deleteMany: {}, // Remove all existing items
          create: kotData.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.total,
            name: item.name
          }))
        }
      },
      include: {
        items: true,
        user: true
      }
    })

    return NextResponse.json(updatedOrder, { status: 200 })
  } catch (error) {
    console.error('Error updating KOT:', error)
    return NextResponse.json({ error: 'Failed to update KOT' }, { status: 500 })
  }
}

export async function GET(req, { params }) {
  const { id } = params // Retrieve the KOT ID from the request parameters

  try {
    // Fetch the latest KOT data based on the ID from the database
    const kotData = await db.kot.findUnique({
      where: { id },
      include: {
        items: true // Include associated items in the response
      }
    })

    // If no KOT data found, return a 404 response
    if (!kotData) {
      return new Response(JSON.stringify({ error: 'KOT not found' }), { status: 404 })
    }

    // Return the KOT data as a JSON response
    return new Response(JSON.stringify(kotData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching KOT data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch KOT data' }), { status: 500 })
  }
}
