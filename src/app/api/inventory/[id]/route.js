import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// PUT (Update an inventory item by ID)
export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { name, amount, price, fixedPrice } = await req.json()

    if (!name || amount == null || price == null || fixedPrice == null) {
      return NextResponse.json({ error: 'All fields (name, amount, price, fixedPrice) are required' }, { status: 400 })
    }

    const updatedItem = await db.inventoryItem.update({
      where: { id },
      data: {
        name,
        amount: parseInt(amount, 10),
        price: parseFloat(price),
        fixedPrice: parseFloat(fixedPrice) // Update fixed price
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
    const deletedItem = await db.inventoryItem.delete({
      where: { id }
    })

    return NextResponse.json(deletedItem, { status: 200 })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
