import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function PUT(req, { params }) {
  const { id } = params

  try {
    // client sends { amountPaid } in the request body for partial or full payment
    const { amountPaid: newPayment } = await req.json()

    if (newPayment == null || isNaN(parseFloat(newPayment))) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 })
    }

    // 1) Find the existing employee:
    const employee = await db.Employees.findUnique({ where: { id } })
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // 2) Calculate new total amountPaid:
    const updatedAmountPaid = employee.amountPaid + parseFloat(newPayment)

    // 3) Determine the new status:
    //    - If updatedAmountPaid >= total salary => Paid
    //    - Else => Pending
    let newStatus = 'Pending'
    if (updatedAmountPaid >= employee.salary) {
      newStatus = 'Paid'
    }

    // 4) Update the record in DB:
    const updatedEmployee = await db.Employees.update({
      where: { id },
      data: {
        amountPaid: updatedAmountPaid,
        status: newStatus,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedEmployee, { status: 200 })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
