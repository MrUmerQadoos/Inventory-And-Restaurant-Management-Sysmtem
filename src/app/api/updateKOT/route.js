import { db } from '@/libs/db/db'

export async function PUT(req) {
  const { id, kotId, newItems } = await req.json()

  try {
    const updatedOrder = await db.$transaction(async prisma => {
      // Update the main order information
      const orderUpdate = await prisma.order.update({
        where: { id },
        data: {
          kotId,
          updatedAt: new Date()
        }
      })

      // Process each new item to add to the order
      await Promise.all(
        newItems.map(async item => {
          // Fetch the itemId based on a unique code or name
          const existingItem = await prisma.item.findUnique({
            where: { code: item.code }, // Assumes 'code' is unique in Item model
            select: { id: true }
          })

          // Ensure that itemId exists for each item before creating OrderItem
          if (!existingItem || !existingItem.id) {
            throw new Error(`Missing itemId for item ${item.name}`)
          }

          // Add each item to the OrderItem table
          await prisma.orderItem.create({
            data: {
              orderId: id,
              itemId: existingItem.id, // Use fetched itemId
              quantity: parseInt(item.quantity, 10),
              unitPrice: parseFloat(item.total) / item.quantity,
              totalPrice: parseFloat(item.total),
              name: item.name
            }
          })
        })
      )

      // Fetch and return the updated order, including new items
      return prisma.order.findUnique({
        where: { id },
        include: { items: true } // Include items in the response
      })
    })

    // Send response with updated order
    return new Response(JSON.stringify({ message: 'KOT updated successfully', order: updatedOrder }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating KOT:', error)
    return new Response(JSON.stringify({ error: 'Failed to update KOT' }), { status: 500 })
  }
}
