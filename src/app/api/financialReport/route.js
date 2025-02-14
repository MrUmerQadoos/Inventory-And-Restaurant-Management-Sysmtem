import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = new Date(searchParams.get('startDate'))
    const endDate = new Date(searchParams.get('endDate'))

    // 1) Fetch all Sales (Product Orders)
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

    // 2) Fetch Delivery Charges (only as Expenses)
    const deliveryOrders = await db.productOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        deliveryCharge: {
          gt: 0
        }
      },
      select: {
        id: true,
        invoiceNumber: true,
        deliveryCharge: true,
        createdAt: true
      }
    })
    const mappedDeliveryCharges = deliveryOrders.map(order => ({
      id: order.id,
      name: `Delivery Charge - Invoice #${order.invoiceNumber}`,
      amount: order.deliveryCharge,
      createdAt: order.createdAt,
      category: 'DeliveryCharge',
      type: 'expense'
    }))

    // 3) Fetch Employee Salaries as Expenses
    const employeeExpenses = await db.employees
      .findMany({
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
      .then(rows =>
        rows.map(emp => ({
          id: emp.id,
          name: `Salary - ${emp.name}`,
          amount: emp.salary,
          createdAt: emp.createdAt,
          category: 'Salary',
          type: 'expense'
        }))
      )

    // 4) Fetch Overhead Expenses
    const overheadExpenses = await db.overheadExpenses
      .findMany({
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
      .then(rows =>
        rows.map(exp => ({
          id: exp.id,
          name: exp.name,
          amount: exp.amount,
          createdAt: exp.createdAt,
          category: 'Overhead',
          type: 'expense'
        }))
      )

    // 5) Fetch Inventory Records and use fixedPrice from each record
    const inventoryRecords = await db.inventoryRecord
      .findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          name: true,
          fixedPrice: true,
          createdAt: true
        }
      })
      .then(rows =>
        rows.map(inv => ({
          id: inv.id,
          name: inv.name,
          amount: inv.fixedPrice, // Use fixedPrice as the expense amount
          createdAt: inv.createdAt,
          category: 'Inventory',
          type: 'expense'
        }))
      )

    // Combine all expenses (Delivery Charges, Salaries, Overheads, Inventory)
    const expenses = [...mappedDeliveryCharges, ...employeeExpenses, ...overheadExpenses, ...inventoryRecords]

    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.finalTotal, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const netProfit = totalSales - totalExpenses

    return NextResponse.json({
      success: true,
      totalSales,
      totalExpenses,
      netProfit,
      // Mark sales as 'sale'
      sales: sales.map(s => ({ ...s, type: 'sale' })),
      expenses // Already categorized as expense items
    })
  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
