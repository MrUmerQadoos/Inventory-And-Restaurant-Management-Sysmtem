import { db } from '@/libs/db/db'

export async function GET(req, { params }) {
  try {
    const bills = await db.bill.findMany({
      where: {
        paymentDetails: {
          method: 'Room Pay',
          checkInId: params.id
        }
      },
      include: {
        paymentDetails: true,
        order: {
          include: {
            items: true
          }
        }
      }
    })

    return new Response(JSON.stringify(bills), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch bills' }), { status: 500 })
  }
}
