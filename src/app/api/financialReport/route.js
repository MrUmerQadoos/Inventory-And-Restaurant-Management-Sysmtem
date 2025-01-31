import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET Financial Report (Sales + Expenses)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = new Date(searchParams.get('startDate'))
    const endDate = new Date(searchParams.get('endDate'))

    // Fetch Sales (Product Orders)
    const sales = await db.productOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        invoiceNumber: true,
        orderType: true,
        finalTotal: true,
        createdAt: true
      }
    })

    // Calculate Total Sales Amount
    const totalSales = sales.reduce((sum, sale) => sum + sale.finalTotal, 0)

    // Fetch Employee Salaries (Expenses)
    const employeeExpenses = await db.employees.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        name: true,
        salary: true,
        createdAt: true
      }
    })

    // Fetch Overhead Expenses
    const overheadExpenses = await db.overheadExpenses.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        name: true,
        amount: true,
        createdAt: true
      }
    })

    // Combine Employee Salaries & Overhead Expenses
    const expenses = [
      ...employeeExpenses.map(emp => ({
        id: emp.id,
        name: `Salary - ${emp.name}`,
        amount: emp.salary,
        createdAt: emp.createdAt
      })),
      ...overheadExpenses.map(exp => ({
        id: exp.id,
        name: exp.name,
        amount: exp.amount,
        createdAt: exp.createdAt
      }))
    ]

    // Calculate Total Expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Calculate Net Profit
    const netProfit = totalSales - totalExpenses

    return NextResponse.json({
      success: true,
      totalSales,
      totalExpenses,
      netProfit,
      sales,
      expenses
    })
  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
