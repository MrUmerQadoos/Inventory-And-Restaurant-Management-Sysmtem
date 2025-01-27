import React from 'react'

const handlePrintCheckoutBill = checkoutData => {
  const printContent = `
    <html>
      <head>
        <title>Checkout Bill</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .total { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Checkout Bill</h2>
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Guest: ${formData.guestName}</p>
        </div>

        <div class="section">
          <h3>Room Charges</h3>
          <table>
            <tr>
              <th>Room</th>
              <th>Nights</th>
              <th>Amount</th>
            </tr>
            ${selectedRooms
              .map(
                room => `
              <tr>
                <td>${room.roomName}</td>
                <td>${room.nights}</td>
                <td>PKR ${room.roomCost}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>

        <div class="section">
          <h3>Minibar Charges</h3>
          <p>Total: PKR ${minibarTotal}</p>
        </div>

        <div class="section">
          <h3>Restaurant Bills</h3>
          <p>Total: PKR ${calculateRestaurantTotal()}</p>
        </div>

        <div class="section total">
          <p>Total Cost: PKR ${calculateTotalCost()}</p>
          <p>Amount Paid: PKR ${amountPaid}</p>
          <p>Pending Amount: PKR ${Math.abs(calculatePendingAmount())}</p>
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '', 'width=800,height=600')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

export default handlePrintCheckoutBill
