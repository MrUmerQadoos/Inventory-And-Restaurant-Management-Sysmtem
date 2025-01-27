// pages/api/deleteBill/[kotId].js

import { db } from '@/libs/db/db'

export async function DELETE(req, { params }) {
  const { kotId } = params

  console.log(`Received request to delete bill for KOT ID: ${kotId}`) // Log the KOT ID

  try {
    // Find the bill associated with the provided KOT ID
    const bill = await db.bill.findFirst({
      where: { kotId }
    })

    // Log the found bill details (or null if not found)
    console.log('Found bill:', bill)

    // If no bill is found, return an error
    if (!bill) {
      console.log('No bill found for the provided KOT ID') // Log when no bill is found
      return new Response(JSON.stringify({ error: 'Bill not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Delete the bill
    await db.bill.delete({
      where: { id: bill.id }
    })

    console.log(`Bill with ID ${bill.id} deleted successfully.`) // Log successful deletion

    return new Response(JSON.stringify({ message: 'Bill deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error deleting bill:', error) // Log the error details
    return new Response(JSON.stringify({ error: 'Failed to delete bill' }), {
      status: 500
    })
  }
}
