import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// PUT (Update employee status or amountPaid)
export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { status, amountPaid } = await req.json()

    if (!status || amountPaid == null) {
      return NextResponse.json({ error: 'Status and amountPaid are required' }, { status: 400 })
    }

    const updatedEmployee = await db.Employees.update({
      where: { id },
      data: {
        status,
        amountPaid: parseFloat(amountPaid),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedEmployee, { status: 200 })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
