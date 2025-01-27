import React from 'react'
import { useSelector } from 'react-redux'
import Cookies from 'js-cookie'

const BillTable = ({ bills }) => {
  const totalAmounts = {
    total: 0,
    totalTax: 0,
    totalNetAmount: 0
  }

  // Getting user information from Redux store or cookies
  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  }

  const role = useSelector(state => state.user.role) || Cookies.get('userRole')

  return (
    <div className='a4-container overflow-x-auto'>
      <table className='min-w-full border border-gray-300'>
        <thead>
          <tr className='bg-gray-200'>
            <th className='border border-gray-300 p-2'>#</th>
            <th className='border border-gray-300 p-2'>Bill ID</th>
            <th className='border border-gray-300 p-2'>Dishes</th>
            <th className='border border-gray-300 p-2'>Amount</th>
            <th className='border border-gray-300 p-2'>Taxes</th>
            <th className='border border-gray-300 p-2'>Net Amount</th>
            {role === 'ADMIN' && <th className='border border-gray-300 p-2'>User Name</th>} {/* New Column */}
            <th className='border border-gray-300 p-2'>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => {
            totalAmounts.total += bill.totalAmount
            totalAmounts.totalTax += (bill.gst || 0) + (bill.serviceTax || 0)
            totalAmounts.totalNetAmount += bill.netAmount

            return (
              <tr key={bill.id}>
                <td className='border border-gray-300 p-2'>{index + 1}</td>
                <td className='border border-gray-300 p-2'>{bill.order.kotId}</td>
                <td className='border border-gray-300 p-2'>
                  {bill.order?.items && bill.order.items.length > 0 ? (
                    bill.order.items.map(item => (
                      <div key={item.id}>
                        {item.item.name} (Qty: {item.quantity}) {/* Display item name */}
                      </div>
                    ))
                  ) : (
                    <div>No items</div>
                  )}
                </td>
                <td className='border border-gray-300 p-2'>{Math.round(bill.totalAmount)}</td>
                <td className='border border-gray-300 p-2'>
                  GST: {Math.round(bill.gst || 0)}, Service Tax: {Math.round(bill.serviceTax || 0)}
                </td>
                <td className='border border-gray-300 p-2'>{Math.round(bill.netAmount)}</td>
                {role === 'ADMIN' && <td className='border border-gray-300 p-2'>{bill.user.name}</td>}
                {/* Show user name only for Admin */}
                <td className='border border-gray-300 p-2'>{bill.paymentDetails?.method}</td>
                {/* Display payment method */}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className='bg-gray-300 font-bold'>
            <td className='border border-gray-300 p-2' colSpan={3}>
              Total
            </td>
            <td className='border border-gray-300 p-2'>{Math.round(totalAmounts.total)}</td>
            <td className='border border-gray-300 p-2'>{Math.round(totalAmounts.totalTax)}</td>
            <td className='border border-gray-300 p-2' colSpan='2'>
              {Math.round(totalAmounts.totalNetAmount)}
            </td>
            {role === 'ADMIN' && <td className='border border-gray-300 p-2'></td>}
            {/* Empty cell for the new column in the footer */}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default BillTable
