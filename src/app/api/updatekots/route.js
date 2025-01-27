// Assuming you are using Express or a similar framework
import { PrismaClient } from '@prisma/client' // Import Prisma Client
const prisma = new PrismaClient() // Initialize Prisma Client

export async function PUT(req) {
  const { id, status } = await req.json() // Ensure you get kotId and status from the request

  try {
    // Validate inputs
    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'kotId and status are required' }), { status: 400 })
    }

    // Check if the status is valid
    const validStatuses = ['COMPLETED', 'CANCELLED'] // Ensure this matches your enum definition
    if (!validStatuses.includes(status.toUpperCase())) {
      return new Response(JSON.stringify({ error: 'Invalid status provided' }), { status: 400 })
    }

    // Now perform the update
    const updatedOrder = await prisma.order.update({
      where: { id: id }, // Make sure kotId is unique or use id if it’s not
      data: {
        status: status.toUpperCase(), // Convert status to uppercase to match enum values
        updatedAt: new Date()
      }
    })

    return new Response(JSON.stringify({ message: 'Order status updated successfully', order: updatedOrder }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return new Response(JSON.stringify({ error: 'Failed to update order status' }), { status: 500 })
  }
}
