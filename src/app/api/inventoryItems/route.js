import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch all inventory items
export async function GET(req) {
  try {
    const inventoryItem = await prisma.inventoryItem.findMany()
    return new Response(JSON.stringify(inventoryItem), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch inventory items' }), { status: 500 })
  }
}

// PATCH: Update the inventory quantity when an item is used
export async function PATCH(req) {
  try {
    const { id, amount } = await req.json()

    // Ensure valid input
    if (!id || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), { status: 400 })
    }

    // Update the inventory item quantity
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        amount: {
          decrement: amount // Reduce the quantity
        }
      }
    })

    return new Response(JSON.stringify(updatedItem), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update inventory item' }), { status: 500 })
  }
}
