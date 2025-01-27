import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET all employees
export async function GET() {
  try {
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

// import { NextResponse } from 'next/server'
// import { db } from '@/libs/db/db' // Adjust the path to match your project structure

// // GET all employees
// export async function GET() {
//   try {
//     const employees = await db.Employees.findMany() // Fetch all employees from the database
//     return NextResponse.json(employees, { status: 200 })
//   } catch (error) {
//     console.error('Error fetching employees:', error)
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
//   }
// }

// // POST a new employee
// export async function POST(req) {
//   try {
//     const { name, designation, salary } = await req.json()

//     // Validate input fields
//     if (!name || !designation || salary == null) {
//       return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
//     }

//     // Add the new employee
//     const newEmployee = await db.Employees.create({
//       data: {
//         name,
//         designation,
//         salary: parseFloat(salary)
//       }
//     })

//     return NextResponse.json(newEmployee, { status: 201 })
//   } catch (error) {
//     console.error('Error creating employee:', error)
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
//   }
// }
