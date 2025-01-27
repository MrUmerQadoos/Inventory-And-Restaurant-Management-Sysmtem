import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// PUT (Update a product)
// PUT (Update a product)
export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { name, amount, price, actualPrice, sellingPrice } = await req.json()

    if (!name || !amount || !price || !actualPrice || !sellingPrice) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const updatedProduct = await db.Products.update({
      where: { id },
      data: { name, amount, price, actualPrice, sellingPrice }
    })

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE a product
export async function DELETE(req, { params }) {
  const { id } = params
  try {
    const deletedProduct = await db.Products.delete({ where: { id } })
    return NextResponse.json(deletedProduct, { status: 200 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
