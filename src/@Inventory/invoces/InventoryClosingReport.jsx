'use client'
import { useState, useEffect, useCallback } from 'react'
import InventoryTable from './InventoryTable'
import BtnGrp from './BtnGrp'
import { useSelector } from 'react-redux'
import Cookies from 'js-cookie'

const InventoryClosingReport = () => {
  const [transactions, setTransactions] = useState([]) // Stores all sales & expenses
  const [filteredTransactions, setFilteredTransactions] = useState([]) // Stores filtered transactions
  const [filter, setFilter] = useState('all') // Active filter: 'all' | 'sales' | 'Salary' | 'Overhead' | 'Inventory'
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date()) // Start Date
  const [endDate, setEndDate] = useState(new Date()) // End Date
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [netProfit, setNetProfit] = useState(0)

  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  }
  const role = useSelector(state => state.user.role) || Cookies.get('userRole')

  // ✅ Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/financialReport', window.location.origin)
      url.searchParams.append('startDate', startDate.toISOString())
      url.searchParams.append('endDate', endDate.toISOString())

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

      // ✅ Ensure categories are used directly from API response
      const categorizedExpenses = expenses.map(exp => ({
        ...exp,
        type: 'expense' // Mark as expense
      }))

      const allTransactions = [...sales.map(sale => ({ ...sale, type: 'sale' })), ...categorizedExpenses]

      setTransactions(allTransactions)
      setFilteredTransactions(allTransactions) // Default: Show all
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // ✅ Filter transactions based on selected category
  const handleFilterChange = newFilter => {
    setFilter(newFilter)

    if (newFilter === 'all') {
      setFilteredTransactions(transactions)
    } else if (newFilter === 'sales') {
      setFilteredTransactions(transactions.filter(t => t.type === 'sale'))
    } else {
      const filtered = transactions.filter(t => t.type === 'expense' && t.category === newFilter)
      console.log(`Filtering for ${newFilter}:`, filtered) // ✅ Debugging log
      setFilteredTransactions(filtered)
    }
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
      />

      {/* Table Display */}
      <InventoryTable transactions={filteredTransactions} />
    </div>
  )
}

export default InventoryClosingReport
