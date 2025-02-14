import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

// GET Financial Report (Sales + Expenses + Inventory + DeliveryCharges)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = new Date(searchParams.get('startDate'))
    const endDate = new Date(searchParams.get('endDate'))

    // 1) Fetch All Sales (Product Orders)
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

    // 2) Fetch Delivery Charges from Orders That Have deliveryCharge > 0
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

    // Map these delivery orders to your “expenses” shape
    const mappedDeliveryCharges = deliveryOrders.map(order => ({
      id: order.id,
      name: `Delivery Charge - Invoice #${order.invoiceNumber}`,
      amount: order.deliveryCharge,
      createdAt: order.createdAt,
      category: 'DeliveryCharge', // So you can filter by 'DeliveryCharge'
      type: 'expense'
    }))

    // 3) Fetch Employee Salaries
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

    // 5) Fetch Inventory Records
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
          amount: true,
          price: true,
          createdAt: true
        }
      })
      .then(rows =>
        rows.map(inv => ({
          id: inv.id,
          name: inv.name,
          amount: inv.amount * inv.price, // total cost
          createdAt: inv.createdAt,
          category: 'Inventory',
          type: 'expense'
        }))
      )

    // Combine all expenses (including Delivery Charges)
    const expenses = [...mappedDeliveryCharges, ...employeeExpenses, ...overheadExpenses, ...inventoryRecords]

    // Sum up the totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.finalTotal, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const netProfit = totalSales - totalExpenses

    // Return the data in the correct format
    return NextResponse.json({
      success: true,
      totalSales,
      totalExpenses,
      netProfit,
      // Mark sales as type: 'sale' for easy filtering in your front-end
      sales: sales.map(s => ({ ...s, type: 'sale' })),
      expenses
    })
  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
