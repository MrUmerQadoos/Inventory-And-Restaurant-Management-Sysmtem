import { NextResponse } from 'next/server'
import { db } from '@/libs/db/db' // Adjust the path to match your project structure

export async function GET() {
  try {
    const bills = await db.bill.findMany({
      include: {
        user: true, // Include the user related to the bill
        order: {
          include: {
            items: {
              include: {
                item: true // Include the item details inside the order
              }
            }
          }
        },
        paymentDetails: true // Include payment details if available
      }
    })
    return NextResponse.json(bills) // Return fetched bills as JSON
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// import { db } from '@/libs/db/db' // Import your Prisma instance

// export async function GET(req) {
//   try {
//     // Fetch all bills from the database
//     const bills = await db.bill.findMany({
//       include: {
//         user: true, // Include related user data
//         order: {
//           include: {
//             items: {
//               include: {
//                 item: true // Include the item details inside the order
//               }
//             }
//           }
//         },
//         paymentDetails: true // Include related payment details
//       }
//     })

//     // Return the fetched bills in JSON format
//     return new Response(JSON.stringify(bills), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//   } catch (error) {
//     // Handle any errors during the fetch
//     console.error('Error fetching bills:', error)
//     return new Response(JSON.stringify({ error: 'Failed to fetch bills' }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//   }
// }
// // // // pages/api/getBills.js

// // // pages/api/getBills.js

// // import { db } from '@/libs/db/db'

// // export async function GET(req) {
// //   try {
// //     // Fetch all bills from the database, including OrderItems
// //     const bills = await db.bill.findMany({
// //       include: {
// //         user: true, // Include related user data if needed
// //         order: {
// //           include: {
// //             items: {
// //               include: {
// //                 item: true // Include the Item model to fetch item details
// //               }
// //             }
// //           }
// //         },
// //         paymentDetails: true // Include related payment details if needed
// //       }
// //     })

// //     // Log the results to the console
// //     // console.log('Fetched Bills:', bills)

// //     return new Response(JSON.stringify(bills), {
// //       status: 200,
// //       headers: {
// //         'Content-Type': 'application/json'
// //       }
// //     })
// //   } catch (error) {
// //     console.error('Error fetching bills:', error)
// //     return new Response(JSON.stringify({ error: 'Failed to fetch bills' }), {
// //       status: 500
// //     })
// //   }
// // }

// // // import { db } from '@/libs/db/db'

// // // export async function GET(req) {
// // //   try {
// // //     // Fetch all bills from the database
// // //     const bills = await db.bill.findMany({
// // //       include: {
// // //         user: true, // Include related user data if needed
// // //         order: true, // Include related order data if needed
// // //         paymentDetails: true // Include related payment details if needed
// // //       }
// // //     })

// // //     // Log the results to the console
// // //     // console.log('Fetched Bills:', bills)

// // //     return new Response(JSON.stringify(bills), {
// // //       status: 200,
// // //       headers: {
// // //         'Content-Type': 'application/json'
// // //       }
// // //     })
// // //   } catch (error) {
// // //     console.error('Error fetching bills:', error)
// // //     return new Response(JSON.stringify({ error: 'Failed to fetch bills' }), {
// // //       status: 500
// // //     })
// // //   }
// // // }
