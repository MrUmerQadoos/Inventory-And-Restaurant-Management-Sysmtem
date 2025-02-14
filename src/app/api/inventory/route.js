import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET all inventory items
export async function GET() {
  try {
    const items = await db.inventoryItem.findMany()
    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST a new inventory item
export async function POST(req) {
  try {
    const { name, amount, price, fixedPrice } = await req.json()

    if (!name || amount == null || price == null || fixedPrice == null) {
      return NextResponse.json({ error: 'All fields (name, amount, price, fixedPrice) are required' }, { status: 400 })
    }

    const unitPrice = parseFloat(price) / parseInt(amount, 10)

    const newItem = await db.inventoryItem.create({
      data: {
        name,
        amount: parseInt(amount, 10),
        price: parseFloat(price),
        fixedPrice: parseFloat(fixedPrice),
        unitPrice // Calculate unit price
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
