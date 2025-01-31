import React from 'react'

const OrderPrintComponent = ({ order }) => {
  const date = new Date().toLocaleString()

  return (
    <div style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
      {/* Print Styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-break { page-break-inside: avoid; }
          img { max-width: 100%; height: auto; margin: 0 auto; display: block; }
        }
      `}</style>

      {/* Invoice Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <img
          src='https://your-logo-url.com' // Replace with actual logo URL
          alt='Company Logo'
          style={{ width: '60px', height: 'auto', marginBottom: '5px' }}
        />
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>SunSet Heights Resort</h2>
        <p>Main Pir Sohawa Road, Islamabad</p>
        <p>UAN: +92 304 1110428</p>
      </div>

      <hr />

      {/* Invoice Details */}
      <div style={{ marginBottom: '10px' }}>
        <p>
          <strong>Invoice No:</strong> {order.invoiceNumber || 'N/A'}
        </p>
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>
          <strong>Customer:</strong> Walk-In Customer
        </p>
      </div>

      {/* Items Table */}
      {order.orderItems.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Product</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{item.sellingPrice} PKR</td>
                <td style={{ textAlign: 'right' }}>{item.totalPrice} PKR</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      {/* Order Totals */}
      <div>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span> <span>{order.totalAmount} PKR</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Waiter Tip:</span> <span>0.00 PKR</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>Total:</span> <span>{order.totalAmount} PKR</span>
        </p>
      </div>

      <hr />

      {/* Footer */}
      <p style={{ textAlign: 'center' }}>Thank You for Your Visit!</p>
      <p style={{ textAlign: 'center' }}>Printed: {date}</p>
    </div>
  )
}

export default OrderPrintComponent
