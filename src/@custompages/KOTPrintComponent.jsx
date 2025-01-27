import React from 'react'

const KOTPrintComponent = ({ kot }) => {
  return (
    <div className='receipt-container' style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
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
          src='https://pub-2f5b50a81b7a40358799d6e7c3b2f968.r2.dev/3m1saj2fe.png'
          alt='Company Logo'
          style={{ width: '60px', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      </div>

      {/* Business Name and Address */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>SunSet Heights Resort And Residencia</h2>
      </div>

      {/* KOT Information Section */}
      <hr />
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{ textAlign: 'center' }}>{kot?.floor || 'N/A'}</h3>
        <p style={{ textAlign: 'center' }}>
          <strong>Waiter: </strong> {kot?.waiterName || 'N/A'}
        </p>
        <p style={{ textAlign: 'center' }}>
          <strong>Table Number:</strong> {kot?.tableNumber || 'N/A'}
        </p>
        <p style={{ textAlign: 'center' }}>
          <strong>KOT ID :</strong> {kot?.kotId || 'N/A'}
        </p>
      </div>

      {/* Items Table (Without Prices) */}
      {kot?.items && Array.isArray(kot.items) && kot.items.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: 'none' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '5px', border: 'none' }}>Product</th>
              <th style={{ textAlign: 'center', paddingBottom: '5px', border: 'none' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {kot.items.map((item, index) => (
              <tr key={index} style={{ border: 'none' }}>
                <td style={{ padding: '5px 0', border: 'none' }}>{item?.name || 'Unknown Item'}</td>
                <td style={{ textAlign: 'center', border: 'none' }}>{item?.quantity || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items available.</p>
      )}

      {/* Total Quantity */}
      <hr />
      <div style={{ marginTop: '10px' }}>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>Total Quantity:</span>
          <span>{(kot?.items || []).reduce((acc, item) => acc + Number(item?.quantity || 0), 0)}</span>
        </p>
      </div>

      <hr />
      {/* Footer Section */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <p>
          <span>Time :</span> {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default KOTPrintComponent

// import React from 'react'

// const KOTPrintComponent = ({ kot }) => {
//   return (
//     <div className='receipt-container' style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
//       <style>{`
//         @media print {
//           img {
//             display: block !important;
//             max-width: 100% !important;
//             height: auto !important;
//             margin: 0 auto !important;
//           }
//           .no-break {
//             page-break-inside: avoid !important;
//           }
//           body {
//             margin: 0 !important;
//           }
//         }
//       `}</style>

//       {/* Logo Section */}
//       <div className='no-break' style={{ textAlign: 'center', marginBottom: '5px' }}>
//         <img
//           src='https://pub-2f5b50a81b7a40358799d6e7c3b2f968.r2.dev/3m1saj2fe.png' // Update with your actual logo URL
//           alt='Company Logo'
//           style={{ width: '60px', height: 'auto', display: 'block', margin: '0 auto' }}
//         />
//       </div>

//       {/* Business Name and Address */}
//       <div style={{ textAlign: 'center', marginBottom: '10px' }}>
//         <h2 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>SunSet Heights Resort And Residencia</h2>
//       </div>

//       {/* KOT Information Section */}
//       <hr />

//       <div style={{ marginBottom: '10px' }}>
//         <h3 style={{ textAlign: 'center' }}>{kot.floor}</h3>
//         <p style={{ textAlign: 'center' }}>
//           <strong>Waiter: </strong> {kot.waiterName}
//         </p>
//         <p style={{ textAlign: 'center' }}>
//           <strong>Table Number:</strong> {kot.tableNumber || 'N/A'}
//         </p>
//         <p style={{ textAlign: 'center' }}>
//           <strong>KOT ID :</strong> {kot.kotId || 'N/A'}
//         </p>
//       </div>

//       {/* Items Table (Without Prices) */}
//       {kot.items && Array.isArray(kot.items) && kot.items.length > 0 ? (
//         <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: 'none' }}>
//           <thead>
//             <tr>
//               <th style={{ textAlign: 'left', paddingBottom: '5px', border: 'none' }}>Product</th>
//               <th style={{ textAlign: 'center', paddingBottom: '5px', border: 'none' }}>Qty</th>
//             </tr>
//           </thead>
//           <tbody>
//             {kot.items.map((item, index) => (
//               <tr key={index} style={{ border: 'none' }}>
//                 <td style={{ padding: '5px 0', border: 'none' }}>{item.name || 'Unknown Item'}</td>{' '}
//                 {/* Displaying name */}
//                 <td style={{ textAlign: 'center', border: 'none' }}>{item.quantity}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No items available.</p>
//       )}

//       {/* Total Quantity */}
//       <hr />
//       <div style={{ marginTop: '10px' }}>
//         <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
//           <span>Total Quantity:</span>
//           <span>{kot.items?.reduce((acc, item) => acc + Number(item.quantity), 0) || 0}</span>
//         </p>
//       </div>

//       <hr />
//       {/* Footer Section */}
//       <div style={{ textAlign: 'center', marginTop: '10px' }}>
//         <p>
//           {' '}
//           <span>Time :</span> {new Date().toLocaleString()}{' '}
//         </p>
//       </div>
//     </div>
//   )
// }

// export default KOTPrintComponent

// // import React from 'react'

// // const KOTPrintComponent = ({ kot }) => {
// //   return (
// //     <div className='receipt-container' style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
// //       {/* Inline @media print style */}
// //       <style>{`
// //   @media print {
// //     img {
// //       display: block !important;
// //       max-width: 100% !important;
// //       height: auto !important;
// //       margin: 0 auto !important;
// //     }
// //     .no-break {
// //       page-break-inside: avoid !important;
// //     }
// //     body {
// //       margin: 0 !important;
// //     }
// //   }
// // `}</style>

// //       {/* Logo Section */}
// //       <div className='no-break' style={{ textAlign: 'center', marginBottom: '5px' }}>
// //         <img
// //           src='https://pub-2f5b50a81b7a40358799d6e7c3b2f968.r2.dev/3m1saj2fe.png' // Update with your actual logo URL
// //           alt='Company Logo'
// //           style={{ width: '60px', height: 'auto', display: 'block', margin: '0 auto' }}
// //         />
// //       </div>

// //       {/* Business Name and Address */}
// //       <div style={{ textAlign: 'center', marginBottom: '10px' }}>
// //         <h2 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>SunSet Heights Resort And Residencia</h2>
// //         {/* <p style={{ margin: '1px 0' }}>Main PirSohawa, Islamabad</p>
// //         <p style={{ margin: '1px 0' }}>UAN Number: +92 304 1110428</p> */}
// //       </div>

// //       {/* KOT Information Section */}
// //       <hr />

// //       <div style={{ marginBottom: '10px' }}>
// //         {/* <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Kitchen Order Ticket</p> */}
// //         <h3 style={{ textAlign: 'center' }}>{kot.floor}</h3>
// //         <p style={{ textAlign: 'center' }}>
// //           <strong>Waiter: </strong> {kot.waiter}
// //         </p>
// //         <p style={{ textAlign: 'center' }}>
// //           <strong>Table Number:</strong> {kot.table || 'N/A'}
// //         </p>
// //         <p style={{ textAlign: 'center' }}>
// //           <strong>KOT ID :</strong> {kot.id || 'N/A'}
// //         </p>
// //       </div>

// //       {/* Items Table (Without Prices) */}
// //       {kot.items && Array.isArray(kot.items) ? (
// //         <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: 'none' }}>
// //           <thead>
// //             <tr>
// //               <th style={{ textAlign: 'left', paddingBottom: '5px', border: 'none' }}>Product</th>
// //               <th style={{ textAlign: 'center', paddingBottom: '5px', border: 'none' }}>Qty</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {kot.items.map((item, index) => (
// //               <tr key={index} style={{ border: 'none' }}>
// //                 <td style={{ padding: '5px 0', border: 'none' }}>{item.name}</td>
// //                 <td style={{ textAlign: 'center', border: 'none' }}>{item.quantity}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       ) : (
// //         <p>No items available.</p>
// //       )}

// //       {/* Total Quantity */}
// //       <hr />
// //       <div style={{ marginTop: '10px' }}>
// //         <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
// //           <span>Total Quantity:</span> <span>{kot.items.reduce((acc, item) => acc + Number(item.quantity), 0)}</span>
// //         </p>
// //       </div>

// //       <hr />
// //       {/* Footer Section */}
// //       <div style={{ textAlign: 'center', marginTop: '10px' }}>
// //         <p>
// //           {' '}
// //           <span>Time :</span> {new Date().toLocaleString()}{' '}
// //         </p>
// //       </div>
// //     </div>
// //   )
// // }

// // export default KOTPrintComponent

// // import React from 'react'

// // const KOTPrintComponent = ({ kot }) => {
// //   return (
// //     <div>
// //       <h2>SunSet Resort</h2>
// //       <h3>{kot.floor}</h3>
// //       <p>
// //         <strong>Kot id:</strong> {kot.id}
// //       </p>
// //       <p>
// //         <strong>WaiterName:</strong> {kot.waiter}
// //       </p>
// //       <p>
// //         <strong>TableNumber:</strong> {kot.table}
// //       </p>
// //       <p>
// //         <strong>Date:</strong> {new Date().toLocaleString()}
// //       </p>

// //       <table>
// //         <thead>
// //           <tr>
// //             <th>Product Name</th>
// //             <th>Quantity</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {kot.items.map((item, index) => (
// //             <tr key={index}>
// //               <td>{item.name}</td>
// //               <td>{item.quantity}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {/* Fix here: Ensure reduce is adding quantities as numbers */}
// //       <p>
// //         <strong>Total Quantity:</strong> {kot.items.reduce((acc, item) => acc + Number(item.quantity), 0)}
// //       </p>
// //     </div>
// //   )
// // }

// // export default KOTPrintComponent
