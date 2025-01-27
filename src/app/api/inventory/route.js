import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

// GET all inventory items
export async function GET() {
  try {
    const items = await db.inventoryItems.findMany()
    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST a new inventory item
export async function POST(req) {
  try {
    const { name, amount, price } = await req.json()

    if (!name || amount == null || price == null) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Calculate the unit price
    const unitPrice = parseFloat(price) / parseInt(amount, 10)

    // Create a new inventory item
    const newItem = await db.inventoryItems.create({
      data: {
        name,
        amount: parseInt(amount, 10),
        price: parseFloat(price),
        UnitPrice: unitPrice
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
