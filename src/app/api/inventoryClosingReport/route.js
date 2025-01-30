import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate') || null
    const endDate = searchParams.get('endDate') || null
    const filter = searchParams.get('filter') || 'all'

    // Fetching data from the database
    const employees = await db.employees.findMany({
      where: { status: 'Paid' }
    })
    const expenses = await db.overheadExpenses.findMany()
    const products = await db.products.findMany({
      include: {
        inventoryItems: true
      }
    })

    // Apply date range filtering if applicable
    let filteredEmployees = employees
    let filteredExpenses = expenses
    let filteredProducts = products

    if (startDate && endDate) {
      filteredEmployees = filteredEmployees.filter(employee => {
        return new Date(employee.createdAt) >= new Date(startDate) && new Date(employee.createdAt) <= new Date(endDate)
      })
      filteredExpenses = filteredExpenses.filter(expense => {
        return new Date(expense.createdAt) >= new Date(startDate) && new Date(expense.createdAt) <= new Date(endDate)
      })
      filteredProducts = filteredProducts.filter(product => {
        return new Date(product.createdAt) >= new Date(startDate) && new Date(product.createdAt) <= new Date(endDate)
      })
    }

    // Filter data based on category
    if (filter === 'Salary') {
      filteredExpenses = []
      filteredProducts = []
    } else if (filter === 'Overhead') {
      filteredEmployees = []
      filteredProducts = []
    } else if (filter === 'Inventory') {
      filteredEmployees = []
      filteredExpenses = []
    }

    // Calculate total expenses (overhead expenses + total paid salaries)
    const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalSalary = filteredEmployees.reduce((sum, employee) => sum + employee.amountPaid, 0)
    const totalExpenses = totalExpense + totalSalary

    // Calculate total profit (sellingPrice - actualPrice) * inventoryWiseAmount for each product
    const totalProfit = filteredProducts.reduce((sum, product) => {
      return sum + (product.sellingPrice - product.actualPrice) * product.inventoryWiseAmount
    }, 0)

    // Calculate net (profit - expenses)
    const net = totalProfit - totalExpenses

    // Return the report data
    return NextResponse.json({
      totalProfit,
      totalExpenses,
      net,
      filteredProducts,
      filteredEmployees,
      filteredExpenses
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
