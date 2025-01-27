import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

// GET all items
export async function GET() {
  try {
    const items = await db.item.findMany()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST a new item
export async function POST(req) {
  try {
    const { code, name, price } = await req.json()

    if (!code || !name || !price) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const newItem = await db.item.create({
      data: { code, name, price: parseFloat(price) }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// // app/api/items/route.js
// import { PrismaClient } from '@prisma/client'
// import { NextResponse } from 'next/server'

// const prisma = new PrismaClient()

// export async function GET() {
//   try {
//     const items = await prisma.item.findMany()
//     return NextResponse.json(items) // Return all items from the database
//   } catch (error) {
//     console.error('Error fetching items:', error)
//     return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
//   }
// }
