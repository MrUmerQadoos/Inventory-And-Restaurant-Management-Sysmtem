import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path as needed

// GET (Fetch a single inventory record by ID)
export async function GET(req, { params }) {
  const { id } = params
  try {
    const record = await db.InventoryRecord.findUnique({
      where: { id }
    })

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json(record, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory record:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT (Update an inventory record by ID)
export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { name, amount, price } = await req.json()

    if (!name || amount == null || price == null) {
      return NextResponse.json({ error: 'Name, amount, and price are required' }, { status: 400 })
    }

    const updatedRecord = await db.InventoryRecord.update({
      where: { id },
      data: {
        name,
        amount: parseInt(amount),
        price: parseFloat(price)
      }
    })

    return NextResponse.json(updatedRecord, { status: 200 })
  } catch (error) {
    console.error('Error updating inventory record:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE (Delete an inventory record by ID)
export async function DELETE(req, { params }) {
  const { id } = params
  try {
    const deletedRecord = await db.InventoryRecord.delete({
      where: { id }
    })

    return NextResponse.json(deletedRecord, { status: 200 })
  } catch (error) {
    console.error('Error deleting inventory record:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
