import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing startDate or endDate' }, { status: 400 })
    }

    const sales = await prisma.products.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching product sales:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
