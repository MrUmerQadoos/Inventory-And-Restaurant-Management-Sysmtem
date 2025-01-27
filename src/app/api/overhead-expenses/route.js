import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path as needed

// GET all overhead expenses
export async function GET() {
  try {
    const expenses = await db.OverheadExpenses.findMany()
    return NextResponse.json(expenses, { status: 200 })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST a new overhead expense
export async function POST(req) {
  try {
    const { name, amount } = await req.json()

    if (!name || amount == null) {
      return NextResponse.json({ error: 'Name and amount are required' }, { status: 400 })
    }

    const newExpense = await db.OverheadExpenses.create({
      data: { name, amount: parseFloat(amount) }
    })

    return NextResponse.json(newExpense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
