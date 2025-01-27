import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export async function GET(req, { params }) {
  const { id } = params // Retrieve the order (KOT) ID from the route parameters

  try {
    // Fetch the latest KOT (Order) data based on the ID
    const kotData = await db.order.findUnique({
      where: { id },
      include: {
        items: true // Include associated items in the response
      }
    })

    // If no KOT data found, return a 404 response
    if (!kotData) {
      return new Response(JSON.stringify({ error: 'KOT not found' }), { status: 404 })
    }

    // Return the KOT data as a JSON response
    return new Response(JSON.stringify(kotData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching KOT data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch KOT data' }), { status: 500 })
  }
}
