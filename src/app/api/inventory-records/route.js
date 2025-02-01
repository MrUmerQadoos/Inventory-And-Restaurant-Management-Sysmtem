import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path as needed

// GET all inventory records
export async function GET() {
  try {
    const records = await db.InventoryRecord.findMany({
      orderBy: { createdAt: 'desc' } // Fetch in descending order
    })
    return NextResponse.json(records, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory records:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST a new inventory record
export async function POST(req) {
  try {
    const { name, amount, price } = await req.json()

    if (!name || amount == null || price == null) {
      return NextResponse.json({ error: 'Name, amount, and price are required' }, { status: 400 })
    }

    const newRecord = await db.InventoryRecord.create({
      data: {
        name,
        amount: parseInt(amount),
        price: parseFloat(price)
      }
    })

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory record:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
