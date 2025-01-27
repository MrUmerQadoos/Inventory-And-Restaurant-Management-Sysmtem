import React from 'react'

const BillPrintComponent = ({ bill }) => {
  const salesTaxPercentage = 3 // 3% sales tax
  const gstTaxPercentage = 13 // 13% GST

  // Safely check if bill.items exists and is an array
  const subTotal = Array.isArray(bill.items) ? bill.items.reduce((sum, item) => sum + item.totalPrice, 0) : 0

  const salesTax = (subTotal * salesTaxPercentage) / 100
  const gstTax = (subTotal * gstTaxPercentage) / 100

  const discount = bill.discount || 0 // Get discount from bill, default to 0 if not present
  const netTotal = subTotal + salesTax + gstTax - discount // Subtract discount from total

  return (
    <div className='receipt-container' style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
      {/* Inline @media print style */}
      <style>{`
        @media print {
          img {
            display: block !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 auto !important;
          }
          .no-break {
            page-break-inside: avoid !important;
          }
          body {
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Logo Section */}
      <div className='no-break' style={{ textAlign: 'center', marginBottom: '5px' }}>
        <img
          src='https://pub-2f5b50a81b7a40358799d6e7c3b2f968.r2.dev/3m1saj2fe.png' // Update with your actual logo URL
          alt='Company Logo'
          style={{ width: '60px', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      </div>

      {/* Business Name and Address */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>SunSet Heights Resort And Residencia</h2>
        <p style={{ margin: '1px 0' }}>Main PirSohawa Road, Islamabad</p>
        <p style={{ margin: '1px 0' }}>UAN Number: +92 304 1110428</p>
      </div>

      {/* Bill Information Section */}
      <hr />

      <div style={{ marginBottom: '10px' }}>
        <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Receipt</p>
        <h3 style={{ textAlign: 'center' }}>{bill.floor}</h3>

        <p style={{ textAlign: 'center' }}>
          <strong>Table No:</strong> {bill.tableNumber || 'N/A'}
        </p>
        <p style={{ textAlign: 'center' }}>
          <strong>Bill No :</strong> {bill.kotId || 'N/A'}
        </p>
      </div>

      {/* Items Table */}
      {bill.items && Array.isArray(bill.items) ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: 'none' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '5px', border: 'none' }}>Product</th>
              <th style={{ textAlign: 'center', paddingBottom: '5px', border: 'none' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '5px', border: 'none' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map(item => (
              <tr key={item.id} style={{ border: 'none' }}>
                <td style={{ padding: '5px 0', border: 'none' }}>{item.name}</td>
                <td style={{ textAlign: 'center', border: 'none' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', border: 'none' }}>{item.totalPrice.toFixed(2)} PKR</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items available.</p>
      )}

      {/* Bill Totals */}
      <hr />
      <div style={{ marginTop: '10px' }}>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Sub Total:</span> <span>{subTotal.toFixed(2)} PKR</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Discount:</span> <span>{discount.toFixed(2)} PKR</span> {/* Display discount */}
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>GST (13%):</span> <span>{gstTax.toFixed(2)} PKR</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Service Tax (3%):</span> <span>{salesTax.toFixed(2)} PKR</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>Total:</span> <span>{netTotal.toFixed(2)} PKR</span>
        </p>
      </div>

      <hr />
      {/* Payment Information */}
      {bill.paymentDetails && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontWeight: 'bold' }}>Paid By: {bill.paymentDetails.method}</p>
          {bill.paymentDetails.method === 'Cash' ? (
            <>
              <p>Cash Paid: {bill.paymentDetails.cashPaid} PKR</p>
              <p>Return Cash: {bill.paymentDetails.returnCash.toFixed(0)} PKR</p>
            </>
          ) : bill.paymentDetails.method === 'Card' ? (
            <p>Transaction ID: {bill.paymentDetails.transactionNumber}</p>
          ) : (
            bill.paymentDetails.method === 'Room Pay' && (
              <>
                <p>Guest Name: {bill.paymentDetails.guestName}</p>
                <p>Room Number: {bill.paymentDetails.roomNumber}</p>
              </>
            )
          )}
        </div>
      )}

      {/* Footer Section */}
      <hr />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <p>{new Date().toLocaleString()}</p>
        <p style={{ textAlign: 'center' }}>
          <strong>Generated By:</strong> ( {bill.user.name || 'N/A'})
        </p>
        <p style={{ textAlign: 'center' }}>
          <strong>Served by:</strong> {bill.waiterName}
        </p>
        <p>Thank You For your visit!</p>
      </div>
    </div>
  )
}

export default BillPrintComponent
