import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db'

export async function GET() {
  try {
    // Fetch all orders with descending order by `createdAt`
    const orders = await db.productOrder.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Filter out orders that may have null `invoiceNumber`
    const validOrders = orders.filter(order => order.invoiceNumber !== null)

    // ✅ Ensure all JSON fields are parsed correctly
    const formattedOrders = validOrders.map(order => ({
      ...order,
      orderItems: order.orderItems || [], // ✅ No need for `JSON.parse()`, Prisma handles JSON fields
      inventoryUsage: order.inventoryUsage || [],
      paymentDetails: order.paymentDetails || {},
      customer: order.customer || null // ✅ Ensure customer details are included
    }))

    return NextResponse.json({ success: true, orders: formattedOrders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const {
      invoiceNumber,
      orderType,
      orderItems,
      totalAmount,
      deliveryCharge,
      paymentDetails,
      timestamp,
      userId,
      customer
    } = await req.json()

    if (!invoiceNumber || !orderType || !orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let inventoryUsage = []
    let totalInventoryCost = 0

    for (const product of orderItems) {
      const productData = await db.products.findUnique({
        where: { id: product.id },
        select: { inventoryUsage: true }
      })

      if (!productData || !productData.inventoryUsage) {
        return NextResponse.json(
          { error: `Product with ID ${product.id} not found or has no inventory usage.` },
          { status: 400 }
        )
      }

      const parsedInventoryUsage = productData.inventoryUsage

      for (const usage of parsedInventoryUsage) {
        const totalRequiredAmount = usage.amount * product.quantity
        const costDeduction = usage.unitPrice * totalRequiredAmount
        totalInventoryCost += costDeduction

        const inventoryItem = await db.inventoryItem.findUnique({
          where: { id: usage.id }
        })

        if (!inventoryItem || inventoryItem.amount < totalRequiredAmount) {
          return NextResponse.json(
            {
              error: `Not enough stock for ${usage.name}. Required: ${totalRequiredAmount}, Available: ${inventoryItem?.amount || 0}`
            },
            { status: 400 }
          )
        }

        await db.inventoryItem.update({
          where: { id: usage.id },
          data: {
            amount: { decrement: totalRequiredAmount },
            price: { decrement: costDeduction }
          }
        })

        inventoryUsage.push({
          id: usage.id,
          name: usage.name,
          unitPrice: usage.unitPrice,
          amount: totalRequiredAmount,
          totalPriceDeduction: costDeduction
        })
      }
    }

    // Calculate the final total dynamically

    const newOrder = await db.productOrder.create({
      data: {
        invoiceNumber,
        orderType,
        orderItems,
        totalAmount,
        deliveryCharge,
        inventoryUsage,
        paymentDetails,
        createdAt: new Date(timestamp),
        userId: userId || null,
        customer: customer || null
      }
    })

    return NextResponse.json(
      { success: true, order: newOrder, message: 'Order placed successfully. Inventory updated.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
