import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET all products
export async function GET() {
  try {
    const products = await db.products.findMany({
      include: {
        inventoryItems: true // Fetch related inventory items
      }
    })
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
export async function POST(req) {
  try {
    const { name, actualPrice, sellingPrice, inventoryWiseAmount, inventoryItems } = await req.json()

    if (!name || !actualPrice || !sellingPrice || !inventoryWiseAmount || inventoryItems.length === 0) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Deduct inventory amounts correctly
    for (const item of inventoryItems) {
      const inventoryItem = await db.inventoryItem.findUnique({
        where: { id: item.id }
      })

      if (!inventoryItem || inventoryItem.amount < item.amount) {
        return NextResponse.json({ error: `Insufficient stock for item: ${item.name}` }, { status: 400 })
      }

      await db.inventoryItem.update({
        where: { id: item.id },
        data: {
          amount: { decrement: item.amount },
          price: { decrement: item.amount * item.unitPrice }
        }
      })
    }

    // Store inventoryUsage separately
    const inventoryUsage = inventoryItems.map(item => ({
      id: item.id,
      name: item.name,
      unitPrice: item.unitPrice,
      amount: item.amount // Store correct amount
    }))

    // Create the new product
    const newProduct = await db.products.create({
      data: {
        name,
        actualPrice: parseFloat(actualPrice),
        sellingPrice: parseFloat(sellingPrice),
        inventoryWiseAmount,
        inventoryItems: {
          connect: inventoryItems.map(item => ({ id: item.id }))
        },
        inventoryUsage // Store the structured usage
      },
      include: { inventoryItems: true }
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
