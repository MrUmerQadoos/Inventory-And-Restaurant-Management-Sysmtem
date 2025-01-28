import React from 'react'

const ProductPrintComponent = ({ product }) => {
  const { name, actualPrice, sellingPrice, inventoryWiseAmount, inventoryItems } = product

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '12px', padding: '10px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>BAIT AL NEMA</h2>
        <p>Main Gt Rd, Taj Town, Kamoke, Pakistan</p>
        <p>Mobile: 03115878660, 03095878660</p>
        <p>www.baitalnema.com</p>
        <hr />
        <h3>Invoice</h3>
        <p>Product: {name}</p>
        <p>Actual Price: {actualPrice} PKR</p>
        <p>Selling Price: {sellingPrice} PKR</p>
        <hr />
        <h4>Inventory Items</h4>
        <ul>
          {inventoryItems.map((item, index) => (
            <li key={index}>
              {item.name} - {item.unitPrice} PKR x {item.amount} = {item.price} PKR
            </li>
          ))}
        </ul>
        <hr />
        <p>Total Inventory Value: {inventoryWiseAmount} PKR</p>
        <p>Thank you for your visit!</p>
      </div>
    </div>
  )
}

export default ProductPrintComponent
