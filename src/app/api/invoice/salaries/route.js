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

    const salaries = await prisma.employees.findMany({
      where: {
        updatedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        id: true,
        name: true,
        designation: true,
        salary: true,
        amountPaid: true,
        status: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching employee salaries:', error)
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
