import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')

    if (!name && !phone) {
      return NextResponse.json({ error: 'Please provide at least a name or phone number' }, { status: 400 })
    }

    // Fetch all orders first (Prisma does not support filtering inside JSON fields)
    const orders = await db.productOrder.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Manually filter orders where the customer JSON contains matching name or phone
    const filteredOrders = orders.filter(order => {
      const customer = order.customer || {} // Ensure `customer` is an object

      return (name && customer.name?.toLowerCase() === name.toLowerCase()) || (phone && customer.phone === phone)
    })

    if (filteredOrders.length === 0) {
      return NextResponse.json({ error: 'No orders found for the given customer' }, { status: 404 })
    }

    // Extract customer details from the first matching order
    const customerData = filteredOrders[0].customer || {}

    return NextResponse.json({ success: true, customer: customerData, orders: filteredOrders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return NextResponse.json({ error: 'Failed to fetch customer orders' }, { status: 500 })
  }
}
