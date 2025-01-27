import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { amount } = await req.json()

    if (amount == null) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    // Fetch the existing inventory item
    const existingItem = await db.inventoryItems.findUnique({ where: { id } })

    if (!existingItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Calculate the new total price
    const updatedPrice = parseFloat(existingItem.UnitPrice) * parseInt(amount, 10)

    // Update the inventory item
    const updatedItem = await db.inventoryItems.update({
      where: { id },
      data: {
        amount: parseInt(amount, 10),
        price: updatedPrice
      }
    })

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE (Delete an inventory item by ID)
export async function DELETE(req, { params }) {
  const { id } = params
  try {
    const deletedItem = await db.inventoryItems.delete({
      where: { id }
    })

    return NextResponse.json(deletedItem, { status: 200 })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
