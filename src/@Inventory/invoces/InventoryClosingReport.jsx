'use client'
import { useState, useEffect, useCallback } from 'react'
import InventoryTable from './InventoryTable'
import BtnGrp from './BtnGrp'
import { useSelector } from 'react-redux'
import Cookies from 'js-cookie'

const InventoryClosingReport = () => {
  // originalTransactions stores both sales and expenses
  const [originalTransactions, setOriginalTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([]) // For filtered view
  const [filter, setFilter] = useState('all') // Active filter state

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const [isLoading, setIsLoading] = useState(false)
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [netProfit, setNetProfit] = useState(0)

  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  }
  const role = useSelector(state => state.user.role) || Cookies.get('userRole')

  // Fetch transactions from API (both sales and expenses)
  const fetchTransactions = useCallback(
    async (customStart, customEnd) => {
      setIsLoading(true)
      try {
        const url = new URL('/api/financialReport', window.location.origin)
        const finalStart = customStart || startDate
        const finalEnd = customEnd || endDate
        url.searchParams.append('startDate', finalStart.toISOString())
        url.searchParams.append('endDate', finalEnd.toISOString())

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        const sales = data.sales || []
        const expenses = data.expenses || []

        const totalSalesAmount = sales.reduce((acc, order) => acc + order.finalTotal, 0)
        const totalExpenseAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0)
        setTotalSales(totalSalesAmount)
        setTotalExpenses(totalExpenseAmount)
        setNetProfit(totalSalesAmount - totalExpenseAmount)

        // Mark sales with type 'sale'
        const salesWithType = sales.map(sale => ({ ...sale, type: 'sale' }))

        // Mark expenses with type 'expense'
        const categorizedExpenses = expenses.map(exp => ({ ...exp, type: 'expense' }))

        // Combine sales and expenses into one array
        const mergedTransactions = [...salesWithType, ...categorizedExpenses]

        // Set the merged transactions without any filters applied
        setOriginalTransactions(mergedTransactions)

        // Initially set the filtered transactions to show all data
        setFilteredTransactions(mergedTransactions)
      } catch (error) {
        console.error('Error fetching financial data:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [startDate, endDate]
  )

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleFilterChange = newFilter => {
    setFilter(newFilter)

    let filteredData = []

    // Filter the transactions based on the selected filter
    if (newFilter === 'all') {
      filteredData = originalTransactions // Show all data
    } else if (newFilter === 'sales') {
      filteredData = originalTransactions.filter(t => t.type === 'sale')
    } else if (newFilter === 'DeliveryCharge') {
      filteredData = originalTransactions.filter(t => t.type === 'expense' && t.category === 'DeliveryCharge')
    } else if (newFilter === 'Salary') {
      filteredData = originalTransactions.filter(t => t.type === 'expense' && t.category === 'Salary')
    } else if (newFilter === 'Overhead') {
      filteredData = originalTransactions.filter(t => t.type === 'expense' && t.category === 'Overhead')
    } else if (newFilter === 'Inventory') {
      filteredData = originalTransactions.filter(t => t.type === 'expense' && t.category === 'Inventory')
    }

    // Set the filtered transactions
    setFilteredTransactions(filteredData)
  }

  const handleDailyReport = () => {
    const now = new Date()
    let dailyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 0, 0)
    if (now < dailyStart) {
      dailyStart.setDate(dailyStart.getDate() - 1)
    }
    const dailyEnd = new Date(dailyStart.getTime() + 24 * 60 * 60 * 1000)
    setStartDate(dailyStart)
    setEndDate(dailyEnd)
    fetchTransactions(dailyStart, dailyEnd)
  }

  const handleFetchWithRange = () => {
    fetchTransactions(startDate, endDate)
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Financial Summary</h1>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your User ID: {user?.id}</p>
      <p>Your Role: {role}</p>

      {/* Summary Boxes */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='p-4 bg-blue-500 text-white text-center rounded shadow-md'>
          <h2 className='text-xl font-bold'>Total Sales</h2>
          <p className='text-lg'>Rs {totalSales.toFixed(2)}</p>
        </div>
        <div className='p-4 bg-red-500 text-white text-center rounded shadow-md'>
          <h2 className='text-xl font-bold'>Total Expenses</h2>
          <p className='text-lg'>Rs {totalExpenses.toFixed(2)}</p>
        </div>
        <div className='p-4 bg-green-500 text-white text-center rounded shadow-md'>
          <h2 className='text-xl font-bold'>Net Profit</h2>
          <p className='text-lg'>Rs {netProfit.toFixed(2)}</p>
        </div>
      </div>

      {isLoading && <p>Loading data...</p>}

      {/* Filter Buttons */}
      <BtnGrp
        setFilter={handleFilterChange}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        role={role}
        handleDailyReport={handleDailyReport}
        handleFetchWithRange={handleFetchWithRange}
      />

      {/* Table Display */}
      <InventoryTable transactions={filteredTransactions} />
    </div>
  )
}

export default InventoryClosingReport
