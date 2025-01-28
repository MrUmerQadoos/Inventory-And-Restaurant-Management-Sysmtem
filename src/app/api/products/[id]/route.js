import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function PUT(req, { params }) {
  try {
    const { id } = params // Get the product ID from the URL
    const { name, actualPrice, sellingPrice, inventoryWiseAmount, inventoryItems } = await req.json()

    // Step 1: Ensure that required fields are provided
    if (!name || !actualPrice || !sellingPrice || !inventoryWiseAmount || !inventoryItems) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Step 2: Find the existing product
    const existingProduct = await db.products.findUnique({
      where: { id },
      include: { inventoryItems: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Step 3: Ensure inventoryUsage is parsed correctly
    let inventoryUsage = []
    if (typeof existingProduct.inventoryUsage === 'string') {
      inventoryUsage = JSON.parse(existingProduct.inventoryUsage)
    } else if (Array.isArray(existingProduct.inventoryUsage)) {
      inventoryUsage = existingProduct.inventoryUsage
    }

    const newInventoryItems = inventoryItems.filter(item => !inventoryUsage.some(usage => usage.id === item.id))

    // Step 4: Deduct inventory usage for the current items
    for (const item of inventoryUsage) {
      const inventoryItem = await db.inventoryItem.findUnique({
        where: { id: item.id }
      })

      if (!inventoryItem || inventoryItem.amount < item.amount) {
        return NextResponse.json({ error: `Insufficient stock for item: ${item.name}` }, { status: 400 })
      }

      await db.inventoryItem.update({
        where: { id: item.id },
        data: {
          amount: { increment: item.amount },
          price: { increment: item.amount * item.unitPrice }
        }
      })
    }

    // Step 5: Deduct new inventory items and ensure stock is available
    for (const item of newInventoryItems) {
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

    // Step 6: Update product data
    const updatedProduct = await db.products.update({
      where: { id },
      data: {
        name,
        actualPrice: parseFloat(actualPrice),
        sellingPrice: parseFloat(sellingPrice),
        inventoryWiseAmount,
        inventoryItems: {
          connect: inventoryItems.map(item => ({ id: item.id }))
        },
        inventoryUsage: JSON.stringify([...inventoryUsage, ...newInventoryItems]) // Update inventoryUsage
      },
      include: { inventoryItems: true }
    })

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = params

  try {
    // Fetch the product to delete
    const product = await db.products.findUnique({
      where: { id },
      include: { inventoryItems: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Use `inventoryUsage` to restore the inventory amounts
    for (const usage of product.inventoryUsage || []) {
      const inventoryItem = await db.inventoryItem.findUnique({
        where: { id: usage.id }
      })

      if (!inventoryItem) continue // Skip if the inventory item doesn't exist

      // Calculate restored amount
      const restoredAmount = usage.amount || 0 // Use `amount` from `inventoryUsage`
      const newAmount = (inventoryItem.amount || 0) + restoredAmount
      const newPrice = newAmount * (inventoryItem.unitPrice || 0)

      // Update inventory item
      await db.inventoryItem.update({
        where: { id: usage.id },
        data: {
          amount: newAmount,
          price: newPrice
        }
      })
    }

    // Delete the product
    const deletedProduct = await db.products.delete({ where: { id } })

    return NextResponse.json(deletedProduct, { status: 200 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
