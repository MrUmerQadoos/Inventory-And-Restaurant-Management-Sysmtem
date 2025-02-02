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
      finalTotal,
      paymentDetails,
      timestamp,
      userId,
      customer // ✅ New: Customer details (name, phone, address)
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

      // ✅ FIX: Prisma already returns JSON, no need for `JSON.parse()`
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

    const newOrder = await db.productOrder.create({
      data: {
        invoiceNumber,
        orderType,
        orderItems, // ✅ No need for `JSON.stringify()`, Prisma stores JSON directly
        totalAmount,
        deliveryCharge,
        finalTotal,
        inventoryUsage, // ✅ Prisma stores JSON directly
        paymentDetails, // ✅ Prisma stores JSON directly
        createdAt: new Date(timestamp),
        userId: userId || null,
        customer: customer || null // ✅ Prisma stores JSON, no need for `JSON.stringify()`
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

// import { NextResponse } from 'next/server'
// import { db } from '@/libs/db/db'

// export async function POST(req) {
//   try {
//     const {
//       totalAmount,
//       receptionistName,
//       orderItems,
//       paymentMethod,
//       cashPaid,
//       returnCash,
//       transactionNumber,
//       userId // Optional, associate with a user
//     } = await req.json()

//     // **Validation: Check Required Fields**
//     if (!totalAmount || !receptionistName || !orderItems || orderItems.length === 0) {
//       return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
//     }

//     let inventoryUsage = [] // Track deducted inventory items
//     let totalInventoryCost = 0 // Track total inventory cost

//     // **Step 1: Deduct Inventory Usage based on the product's inventory dependencies**
//     for (const product of orderItems) {
//       const productData = await db.products.findUnique({
//         where: { id: product.id }, // Fetch full product details
//         select: { inventoryUsage: true } // Get inventory usage details
//       })

//       if (!productData || !productData.inventoryUsage) {
//         return NextResponse.json(
//           { error: `Product with ID ${product.id} not found or has no inventory usage.` },
//           { status: 400 }
//         )
//       }

//       // Deduct each required inventory item based on product quantity
//       for (const usage of productData.inventoryUsage) {
//         const totalRequiredAmount = usage.amount * product.quantity // Multiply required amount by ordered quantity
//         const costDeduction = usage.unitPrice * totalRequiredAmount // Calculate cost to deduct from totalAmount
//         totalInventoryCost += costDeduction // Add to total inventory cost

//         // Find the exact inventory item using its ID
//         const inventoryItem = await db.inventoryItem.findUnique({
//           where: { id: usage.id }
//         })

//         if (!inventoryItem) {
//           return NextResponse.json(
//             { error: `Inventory item with ID ${usage.id} (${usage.name}) not found.` },
//             { status: 400 }
//           )
//         }

//         if (inventoryItem.amount < totalRequiredAmount) {
//           return NextResponse.json(
//             {
//               error: `Not enough stock for ${usage.name}. Required: ${totalRequiredAmount}, Available: ${inventoryItem.amount}`
//             },
//             { status: 400 }
//           )
//         }

//         const totalPriceDeduction = usage.unitPrice * totalRequiredAmount // Total price to remove

//         // Deduct inventory stock & price
//         await db.inventoryItem.update({
//           where: { id: usage.id },
//           data: {
//             amount: { decrement: totalRequiredAmount },
//             price: { decrement: totalPriceDeduction } // Deduct total price
//           }
//         })

//         // Track inventory changes
//         inventoryUsage.push({
//           id: usage.id,
//           name: usage.name,
//           unitPrice: usage.unitPrice,
//           amount: totalRequiredAmount,
//           totalPriceDeduction // Log total price deducted
//         })
//       }
//     }

//     // **Step 2: Adjust Total Amount by Deducting Inventory Cost**
//     const finalTotalAmount = totalAmount - totalInventoryCost

//     // **Step 3: Create the new order and include inventoryUsage**
//     const paymentDetails = {
//       method: paymentMethod || 'Cash',
//       totalAmount: finalTotalAmount, // Adjusted Total Amount
//       cashPaid: paymentMethod === 'Cash' ? cashPaid : null,
//       returnCash: paymentMethod === 'Cash' ? returnCash : null,
//       transactionNumber: paymentMethod === 'Card' ? transactionNumber : null
//     }

//     const newOrder = await db.productOrder.create({
//       data: {
//         totalAmount: finalTotalAmount, // Save adjusted total amount
//         receptionistName: receptionistName,
//         orderItems: JSON.stringify(orderItems), // Store order items as JSON
//         inventoryUsage: JSON.stringify(inventoryUsage), // Store inventory usage as JSON
//         paymentMethod: paymentDetails.method,
//         cashPaid: paymentDetails.cashPaid,
//         returnCash: paymentDetails.returnCash,
//         transactionNumber: paymentDetails.transactionNumber,
//         userId: userId || null // Associate the order with a user (optional)
//       }
//     })

//     // **Step 4: Reset Everything After Success**
//     return NextResponse.json(
//       {
//         success: true,
//         order: newOrder,
//         message: 'Order placed successfully. Inventory updated, prices deducted, and total amount adjusted.'
//       },
//       { status: 201 }
//     )
//   } catch (error) {
//     console.error('Error creating order and deducting inventory:', error)
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
//   }
// }
