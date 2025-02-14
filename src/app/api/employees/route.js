import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET all employees
export async function GET() {
  try {
    // 1) Check if today is the first day of the month:
    const today = new Date()
    if (today.getDate() === 1) {
      // 2) Reset all employees to Unpaid with amountPaid = 0:
      await db.Employees.updateMany({
        data: {
          status: 'Unpaid',
          amountPaid: 0
        }
      })
    }

    // 3) Now retrieve all employees
    const employees = await db.Employees.findMany()
    return NextResponse.json(employees, { status: 200 })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST a new employee
export async function POST(req) {
  try {
    const { name, designation, salary } = await req.json()

    if (!name || !designation || salary == null) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const newEmployee = await db.Employees.create({
      data: {
        name,
        designation,
        salary: parseFloat(salary),
        amountPaid: 0,
        status: 'Unpaid'
      }
    })

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
