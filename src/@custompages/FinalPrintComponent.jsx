import React from 'react'

const FinalPrintComponent = ({ bill }) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Logo Section */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src='/path-to-your-logo.png' alt='Company Logo' style={{ width: '100px', height: 'auto' }} />
        <h2 style={{ margin: '5px 0' }}>SunSet Resort</h2>
        <p>Cafe Hall</p>
        <p>Table: {bill.table}</p>
      </div>

      {/* Bill Information Section */}
      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>POS Code:</strong> {bill.posCode || 'N/A'}
        </p>
        <p>
          <strong>Date:</strong> {new Date().toLocaleString()}
        </p>
        <p>
          <strong>Waiter:</strong> {bill.waiter}
        </p>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid black', textAlign: 'left', paddingBottom: '8px' }}>Product Name</th>
            <th style={{ borderBottom: '1px solid black', textAlign: 'left', paddingBottom: '8px' }}>Qty</th>
            <th style={{ borderBottom: '1px solid black', textAlign: 'left', paddingBottom: '8px' }}>Price</th>
            <th style={{ borderBottom: '1px solid black', textAlign: 'left', paddingBottom: '8px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: '8px 0' }}>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price} PKR</td>
              <td>{item.total} PKR</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bill Totals */}
      <div style={{ marginTop: '20px' }}>
        <p>
          <strong>Gross Total:</strong> {bill.totalAmount} PKR
        </p>
        <p>
          <strong>Discount:</strong> 0 PKR
        </p>{' '}
        {/* You can modify this based on logic */}
        <p>
          <strong>Net Total:</strong> {bill.totalAmount} PKR
        </p>
      </div>

      {/* Payment Information */}
      {bill.paymentDetails && (
        <div style={{ marginTop: '20px' }}>
          <h3>Payment Information</h3>
          {bill.paymentDetails.method === 'Cash' ? (
            <div>
              <p>
                <strong>Payment Method:</strong> Cash
              </p>
              <p>
                <strong>Cash Paid:</strong> {bill.paymentDetails.cashPaid} PKR
              </p>
              <p>
                <strong>Return Cash:</strong> {bill.paymentDetails.returnCash} PKR
              </p>
            </div>
          ) : bill.paymentDetails.method === 'Card' ? (
            <div>
              <p>
                <strong>Payment Method:</strong> Card
              </p>
              <p>
                <strong>Transaction Number:</strong> {bill.paymentDetails.transactionNumber}
              </p>
            </div>
          ) : (
            <p>
              <strong>Payment Method:</strong> Not Available
            </p>
          )}
        </div>
      )}

      {/* Footer Section */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p>Thank you for your visit!</p>
      </div>
    </div>
  )
}

export default FinalPrintComponent
