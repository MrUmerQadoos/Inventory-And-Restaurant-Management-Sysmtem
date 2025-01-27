import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET all products
export async function GET() {
  try {
    const products = await db.Products.findMany()
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, amount, price, actualPrice, sellingPrice } = await req.json()

    if (!name || !amount || !price || !actualPrice || !sellingPrice) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Add product
    const newProduct = await db.Products.create({
      data: { name, amount, price, actualPrice, sellingPrice }
    })

    // Fetch the inventory item
    const inventoryItem = await db.InventoryItems.findUnique({ where: { name } })
    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Deduct amount from inventory and recalculate total price
    const updatedInventory = await db.InventoryItems.update({
      where: { name },
      data: {
        amount: { decrement: amount },
        price: inventoryItem.UnitPrice * (inventoryItem.amount - amount) // Update total price
      }
    })

    return NextResponse.json({ newProduct, updatedInventory }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
