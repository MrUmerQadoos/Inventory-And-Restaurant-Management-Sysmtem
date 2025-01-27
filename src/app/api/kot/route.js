// app/api/kot/route.js
import { PrismaClient } from '@prisma/client' // Import Prisma Client
import { NextResponse } from 'next/server'

const prisma = new PrismaClient() // Initialize Prisma Client

export async function GET(req) {
  try {
    // Extract the user ID from query parameters
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // Ensure the userId is provided
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Fetch KOTs from the database where the userId matches and status is 'PENDING'
    const kots = await prisma.order.findMany({
      where: {
        userId: userId,
        status: 'PENDING'
      },
      include: {
        items: true, // Include related items in the response
        bill: true, // Include related bill in the response if needed
        user: true
      }
    })

    // Return the KOTs as JSON
    return NextResponse.json(kots, { status: 200 })
  } catch (error) {
    console.error('Error fetching KOTs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    // Extract the data from the request body
    const { userId, items, floor, tableNumber, waiterName, kotId } = await req.json()

    // Ensure the required fields are provided
    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch the user's name based on the userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true } // Only select the user's name
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate the total amount based on items
    const totalAmount = items.reduce((total, item) => {
      const unitPrice = parseFloat(item.unitPrice) // Ensure unitPrice is a number
      return total + (isNaN(unitPrice) ? 0 : unitPrice * item.quantity)
    }, 0)

    const stringKotId = String(kotId)

    // Create a unique KOT ID

    // Create the order (KOT) in the database
    const order = await prisma.order.create({
      data: {
        kotId: stringKotId, // Pass the KOT ID here
        userId: userId,
        status: 'PENDING', // Initial order status
        totalAmount: totalAmount, // Store the calculated totalAmount here
        waiterName, // Save the waiterName
        tableNumber, // Save the tableNumber
        floor, // Save the floor
        items: {
          create: items.map(item => ({
            itemId: item.itemId, // Ensure itemId is provided
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice) || 0, // Make sure unitPrice is a number
            totalPrice: item.quantity * (parseFloat(item.unitPrice) || 0), // Calculate totalPrice for each item
            name: item.name // Save the item name here
          }))
        },
        bill: {
          create: {
            totalAmount: totalAmount, // Set totalAmount based on the total of the items
            netAmount: totalAmount,
            kotId: stringKotId, // This can also include any discounts if needed
            user: {
              connect: { id: userId } // Connect the existing user to the bill
            }
          }
        }
      },
      include: {
        items: true, // Include order items in the response
        bill: true // Include the bill details in the response
      }
    })

    // Return the created KOT with the KOT ID and the user's name
    return NextResponse.json(
      {
        kotId, // Return the KOT ID
        userName: user.name, // Return the user's name
        order // Return the full order details
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req) {
  const { kotId, status } = await req.json()

  try {
    console.log('Incoming KOT ID:', kotId, 'Status:', status) // Debugging output

    const updatedKOT = await db.order.update({
      where: { kotId: kotId },
      data: {
        status: status,
        updatedAt: new Date()
      }
    })

    return new Response(JSON.stringify({ message: 'KOT updated successfully', order: updatedKOT }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error updating KOT:', error)
    return new Response(JSON.stringify({ error: 'Failed to update KOT' }), { status: 500 })
  }
}
