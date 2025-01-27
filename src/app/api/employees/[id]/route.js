import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

// PUT (Update an employee by ID)
export async function PUT(req, { params }) {
  const { id } = params
  try {
    const { name, designation, salary } = await req.json()

    // Validate input fields
    if (!name || !designation || salary == null) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Update the employee
    const updatedEmployee = await db.Employees.update({
      where: { id },
      data: {
        name,
        designation,
        salary: parseFloat(salary)
      }
    })

    return NextResponse.json(updatedEmployee, { status: 200 })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE (Delete an employee by ID)
export async function DELETE(req, { params }) {
  const { id } = params
  try {
    // Delete the employee
    const deletedEmployee = await db.Employees.delete({
      where: { id }
    })

    return NextResponse.json(deletedEmployee, { status: 200 })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
