import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(req, { params }) {
  const { id } = params

  try {
    // Fetch the order details before deleting
    const order = await prisma.productOrder.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // ✅ Parse `inventoryUsage` as it's stored as a JSON string
    let inventoryUsage = []
    try {
      inventoryUsage = JSON.parse(order.inventoryUsage)
    } catch (error) {
      console.error('Failed to parse inventoryUsage:', error)
      return NextResponse.json({ error: 'Corrupted inventory data' }, { status: 500 })
    }

    // ✅ Restore inventory items
    for (const usage of inventoryUsage) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: String(usage.id) } // Ensure id is converted to string
      })

      if (inventoryItem) {
        // ✅ Restore item amount & update price
        const newAmount = inventoryItem.amount + (usage.amount || 0)
        const newPrice = newAmount * (inventoryItem.unitPrice || 0)

        await prisma.inventoryItem.update({
          where: { id: String(usage.id) },
          data: { amount: newAmount, price: newPrice }
        })
      }
    }

    // ✅ Delete the order
    await prisma.productOrder.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Order deleted successfully!' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
