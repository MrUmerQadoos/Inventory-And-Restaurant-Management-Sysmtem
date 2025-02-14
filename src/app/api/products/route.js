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

    // Parse expenses field if it's stored as a string
    const productsWithParsedExpenses = products.map(product => ({
      ...product,
      expenses: product.expenses ? JSON.parse(product.expenses) : []
    }))

    return NextResponse.json(productsWithParsedExpenses, { status: 200 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, actualPrice, sellingPrice, inventoryWiseAmount, inventoryItems, expenses } = await req.json()

    // ✅ Validate Required Fields
    if (!name || !actualPrice || !sellingPrice || !inventoryWiseAmount || inventoryItems.length === 0) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // ✅ Store inventoryUsage separately without modifying inventory
    const inventoryUsage = inventoryItems.map(item => ({
      id: item.id,
      name: item.name,
      unitPrice: item.unitPrice,
      amount: item.amount // Store the amount but do not decrement stock
    }))

    // ✅ Convert Expenses to JSON Format for Storage
    // Convert Expenses to JSON Format for Storage
    // ✅ Convert Expenses to JSON Format for Storage
    // ✅ Convert Expenses to JSON Format for Storage
    const expensesData = expenses && expenses.length > 0 ? JSON.stringify(expenses) : '[]'

    // Create the new product with inventory items and expenses
    const newProduct = await db.products.create({
      data: {
        name,
        actualPrice: parseFloat(actualPrice),
        sellingPrice: parseFloat(sellingPrice),
        inventoryWiseAmount,
        inventoryItems: {
          connect: inventoryItems.map(item => ({ id: item.id }))
        },
        inventoryUsage, // Store inventory usage details
        expenses: expensesData // Store expenses as JSON string
      },
      include: { inventoryItems: true }
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
