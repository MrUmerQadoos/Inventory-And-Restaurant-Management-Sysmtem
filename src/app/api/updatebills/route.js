import { db } from '@/libs/db/db'

export async function PUT(req) {
  const { id, totalAmount, discount, gst, serviceTax, netAmount, paymentDetails, generatedBy, kotId } = await req.json()

  try {
    const updatedBill = await db.$transaction(async prisma => {
      // Update the bill first
      const billUpdate = await prisma.bill.update({
        where: { id: id },
        data: {
          totalAmount: parseFloat(totalAmount),
          discount: parseFloat(discount),
          gst: parseFloat(gst),
          serviceTax: parseFloat(serviceTax),
          netAmount: parseFloat(netAmount),
          kotId: kotId,
          updatedAt: new Date()
        }
      })

      // Create or update payment details
      const paymentDetail = await prisma.paymentDetails.upsert({
        where: { billId: billUpdate.id },
        update: {
          method: paymentDetails.method,
          totalAmount: parseFloat(netAmount), // Add total amount to every payment
          cashPaid: paymentDetails.cashPaid ? parseFloat(paymentDetails.cashPaid) : null,
          returnCash: paymentDetails.returnCash ? parseFloat(paymentDetails.returnCash) : null,
          transactionNumber: paymentDetails.transactionNumber || null,
          ...(paymentDetails.method === 'Room Pay' && {
            checkInId: paymentDetails.checkInId,
            guestName: paymentDetails.guestName
          })
        },
        create: {
          billId: billUpdate.id,
          method: paymentDetails.method,
          totalAmount: parseFloat(netAmount), // Add total amount to every payment
          cashPaid: paymentDetails.cashPaid ? parseFloat(paymentDetails.cashPaid) : null,
          returnCash: paymentDetails.returnCash ? parseFloat(paymentDetails.returnCash) : null,
          transactionNumber: paymentDetails.transactionNumber || null,
          ...(paymentDetails.method === 'Room Pay' && {
            checkInId: paymentDetails.checkInId,
            guestName: paymentDetails.guestName
          })
        }
      })

      return prisma.bill.findUnique({
        where: { id: billUpdate.id },
        include: {
          paymentDetails: true
        }
      })
    })

    return new Response(
      JSON.stringify({
        message: 'Bill updated successfully',
        bill: updatedBill
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error updating bill:', error)
    return new Response(JSON.stringify({ error: 'Failed to update bill' }), { status: 500 })
  }
}

// import { db } from '@/libs/db/db'

// export async function PUT(req) {
//   const { id, totalAmount, discount, gst, serviceTax, netAmount, paymentDetails, generatedBy, kotId } = await req.json() // Include netAmount and kotId

//   try {
//     // Start a transaction
//     const updatedBill = await db.$transaction(async prisma => {
//       // Update the bill first
//       const billUpdate = await prisma.bill.update({
//         where: { id: id },
//         data: {
//           totalAmount: parseFloat(totalAmount), // Ensure values are parsed to appropriate types
//           discount: parseFloat(discount),
//           gst: parseFloat(gst),
//           serviceTax: parseFloat(serviceTax),
//           netAmount: parseFloat(netAmount),
//           kotId: kotId, // Update the kotId if necessary
//           updatedAt: new Date()
//         }
//       })

//       // Then create or update payment details
//       const paymentDetail = await prisma.paymentDetails.upsert({
//         where: { billId: billUpdate.id },
//         update: {
//           method: paymentDetails.method,
//           cashPaid: paymentDetails.cashPaid ? parseFloat(paymentDetails.cashPaid) : null,
//           returnCash: paymentDetails.returnCash ? parseFloat(paymentDetails.returnCash) : null,
//           transactionNumber: paymentDetails.transactionNumber || null
//         },
//         create: {
//           method: paymentDetails.method,
//           cashPaid: paymentDetails.cashPaid ? parseFloat(paymentDetails.cashPaid) : null,
//           returnCash: paymentDetails.returnCash ? parseFloat(paymentDetails.returnCash) : null,
//           transactionNumber: paymentDetails.transactionNumber || null,
//           billId: billUpdate.id
//         }
//       })

//       return billUpdate // Return the updated bill
//     })

//     return new Response(JSON.stringify({ message: 'Bill updated successfully', bill: updatedBill }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//   } catch (error) {
//     console.error('Error updating bill:', error)
//     return new Response(JSON.stringify({ error: 'Failed to update bill' }), { status: 500 })
//   }
// }
