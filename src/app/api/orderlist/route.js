import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req) {
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit')) || 10 // Default to 10 latest orders

  try {
    const orders = await prisma.productOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit // Fetch latest orders
    })

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
