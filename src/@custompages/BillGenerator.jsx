'use client'
import { useState, useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Grid, Typography, Button, Modal, Box, TextField, CircularProgress, Select, MenuItem } from '@mui/material'
import KOTItemsTable from './KOTItemsTable'
import PendingKOT from './PendingKOT'
import BillDisplay from './BillDisplay'
import KOTPrintComponent from './KOTPrintComponent' // Import the print component
import BillPrintComponent from './BillPrintComponent'
import { useSelector } from 'react-redux'
import KOTForm from './KOTForm'
import Cookies from 'js-cookie'
import KOTList from './KOTList'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  maxHeight: '90vh', // Set the maximum height for the modal (90% of the viewport height)
  overflowY: 'auto' // Enable vertical scrolling if content exceeds the height
}

const BillGenerator = () => {
  const [kotItems, setKotItems] = useState([]) // Store current KOT items
  const [kotToPrint, setKotToPrint] = useState(null) // Store the KOT to be printed
  const [billToPrint, setBillToPrint] = useState(null) // Store the Bill to be printed
  const [pendingKOTs, setPendingKOTs] = useState([]) // State to store pending KOTs

  const [bill, setBill] = useState(null) // Store the generated bill
  const [dishCode, setDishCode] = useState('') // Current dish code input
  const [currentItem, setCurrentItem] = useState(null) // Current selected item
  const [quantity, setQuantity] = useState(1) // Current quantity
  const [waiterName, setWaiterName] = useState('') // Waiter's name
  const [tableNumber, setTableNumber] = useState('') // tableNumber

  const [openPaymentModal, setOpenPaymentModal] = useState(false) // To handle Payment modal
  const [newKotItems, setNewKotItems] = useState([]) // New items for update
  const [paymentMethod, setPaymentMethod] = useState(null) // Cash or Card
  const [cashPaid, setCashPaid] = useState('') // For cash payments
  const [returnCash, setReturnCash] = useState('') // For cash payments
  const [transactionNumber, setTransactionNumber] = useState('') // For card payments

  const [floor, setFloor] = useState('Roof Top') // Selected floor

  const [openModal, setOpenModal] = useState(false) // State to handle modal open/close
  const [openBillModal, setOpenBillModal] = useState(false) // State for Bill modal

  const [openUpdateModal, setOpenUpdateModal] = useState(false)
  const [selectedKOT, setSelectedKOT] = useState(null)

  const [currentKOTId, setCurrentKOTId] = useState(0) // State to hold the current KOT ID

  const [discountPercent, setDiscountPercent] = useState(0) // State to hold discount percentage

  const [availableItems, setAvailableItems] = useState([]) // State to hold available items

  const [refresh, setRefresh] = useState(false) // State to trigger refresh

  const [isDiscountApplied, setIsDiscountApplied] = useState(false) // New state to manage button disabled status

  const [kotCallCount, setKotCallCount] = useState(0) // Track number of KOT calls

  const [isUpdatingKOT, setIsUpdatingKOT] = useState(false)
  const [isGeneratingKOT, setIsGeneratingKOT] = useState(false)
  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)

  const handleRoomPay = async () => {
    try {
      const response = await fetch(`/api/guests?name=${guestName}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableRooms(data.rooms || []) // Assuming rooms are returned under "rooms"
      } else {
        console.error('Failed to fetch rooms')
      }
    } catch (error) {
      console.error('Error fetching guest rooms:', error)
    }
  }

  const applyDiscount = () => {
    if (isDiscountApplied) return

    const subtotal = billToPrint.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discountAmount = (subtotal * discountPercent) / 100
    const newTotalAmount = subtotal - discountAmount

    setBillToPrint(prevBill => ({
      ...prevBill,
      discount: discountAmount, // Save discount amount
      totalAmount: subtotal, // Set subtotal as totalAmount
      netAmount: newTotalAmount + newTotalAmount * 0.13 + newTotalAmount * 0.03 // Apply taxes on discounted total
    }))

    setIsDiscountApplied(true)
  }

  const user = useSelector(state => state.user.authUser) || {
    name: Cookies.get('userName'),
    id: Cookies.get('UserId')
  } // Fallback to cookies if user is not available in state

  const role = useSelector(state => state.user.role) || Cookies.get('userRole') // Fallback to cookies if role is not available in state

  useEffect(() => {
    const fetchPendingKOTs = async () => {
      if (!user.id) return // Prevent fetching if user ID is not available
      try {
        const response = await fetch(`/api/kot?userId=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch KOTs')
        const data = await response.json()
        console.log('Fetched KOTs:', data) // Log the fetched KOTs
        setPendingKOTs(data) // Set the fetched KOTs
      } catch (error) {
        console.error('Error fetching pending KOTs:', error)
      }
    }

    fetchPendingKOTs()
  }, [user.id, refresh]) // Include `refresh` in the dependency array

  // useEffect(() => {
  //   const fetchKOTIds = async () => {
  //     try {
  //       // Add a cache-busting query parameter with current timestamp
  //       const response = await fetch(`/api/kotId?timestamp=${new Date().getTime()}`, {
  //         method: 'GET',
  //         headers: {
  //           'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
  //           Pragma: 'no-cache',
  //           Expires: '0'
  //         }
  //       })

  //       if (!response.ok) {
  //         throw new Error('Failed to fetch KOT IDs')
  //       }

  //       const data = await response.json()
  //       console.log('Fetched KOT IDs:', data)

  //       // Extract kotId and calculate max KOT ID
  //       if (data && data.length > 0) {
  //         const maxKOTId = Math.max(...data.map(bill => Number(bill.kotId))) // Get max KOT ID
  //         setCurrentKOTId(maxKOTId + 1) // Increment for the next KOT ID
  //       } else {
  //         setCurrentKOTId(1000) // Start from 1000 if no KOT IDs are found
  //       }
  //     } catch (error) {
  //       console.error('Error fetching KOT IDs:', error)
  //     }
  //   }

  //   fetchKOTIds()
  // }, [refresh])

  useEffect(() => {
    const fetchLatestKOTId = async () => {
      try {
        const response = await fetch('/api/latestKotId', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch latest KOT ID')
        }

        const data = await response.json()
        const latestId = data.latestKotId || 999 // If no KOT exists, start from 999
        setCurrentKOTId(latestId + 1) // Set the next KOT ID
      } catch (error) {
        console.error('Error fetching latest KOT ID:', error)
        setCurrentKOTId(1000) // Fallback to 1000 if fetch fails
      }
    }

    fetchLatestKOTId()
  }, [refresh]) // Fetch latest KOT ID when component mounts or refreshes

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items')
        if (!response.ok) throw new Error('Failed to fetch items')
        const data = await response.json()
        setAvailableItems(data) // Set the available items from the response
      } catch (error) {
        console.error('Error fetching items:', error)
      }
    }

    fetchItems()
  }, [])

  const MakeDone = async kot => {
    try {
      const response = await fetch(`/api/updatekots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: kot.id, status: 'COMPLETED' }) // Ensure correct payload
      })

      if (!response.ok) {
        throw new Error('Failed to mark KOT as completed')
      }

      setRefresh(prev => !prev) // Refresh the list of pending KOTs
    } catch (error) {
      console.error('Error updating KOT status:', error)
    }
  }

  const addItemToKOT = () => {
    if (!currentItem || quantity <= 0) return // Ensure currentItem is valid

    const kotItem = {
      id: currentItem.id, // Include item ID
      name: currentItem.name, // Include item name

      quantity,
      price: currentItem.price, // Ensure to include the item price
      itemId: currentItem.id // Ensure to include itemId
    }

    setKotItems([...kotItems, kotItem]) // Add the item to the KOT
    setDishCode('') // Clear dish code after adding item
    setCurrentItem(null) // Clear selected item after adding
    setQuantity(1) // Reset quantity to 1
  }

  const printKOT = kot => {
    setKotToPrint(kot) // Set the KOT to be printed
    setOpenModal(true) // Open modal for KOT
  }

  const printBill = bill => {
    setBillToPrint(bill) // Set the Bill to be printed
    setOpenBillModal(true) // Open modal for Bill
  }

  const handleDishCodeChange = code => {
    setDishCode(code)
    const selectedItem = availableItems.find(item => item.code === code) // Make sure to match the case correctly
    setCurrentItem(selectedItem || null) // If item doesn't exist, set currentItem to null
  }

  const handleOpenUpdateModal = kot => {
    setSelectedKOT(kot)
    setNewKotItems([]) // Reset new items for each update session
    setDishCode('')
    setCurrentItem(null)
    setQuantity(1)
    setOpenUpdateModal(true)
  }

  const handleCloseUpdateModal = () => {
    setSelectedKOT(null)
    setNewKotItems([]) // Clear new items on close
    setOpenUpdateModal(false)
  }

  const addItemToNewKOT = () => {
    if (currentItem && quantity > 0) {
      const newItem = {
        code: dishCode,
        name: currentItem.name,
        quantity,
        total: currentItem.price * quantity,
        diningArea: selectedKOT?.floor || 'N/A'
      }
      setNewKotItems([...newKotItems, newItem]) // Add new item to the newKotItems list
      setDishCode('') // Clear dish code after adding
      setCurrentItem(null) // Clear selected item
      setQuantity(1) // Reset quantity
    }
  }

  const handleUpdateKOT = async () => {
    if (newKotItems.length === 0) return
    setIsUpdatingKOT(true) // Start loading

    try {
      const response = await fetch('/api/updateKOT', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedKOT.id,
          kotId: selectedKOT.kotId,
          newItems: newKotItems
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update KOT')
      }

      const updatedOrder = await response.json()
      console.log('KOT updated successfully:', updatedOrder)

      // Close the update modal
      setOpenUpdateModal(false)

      // Set only new items to print and open the modal for printing
      setKotToPrint({
        items: newKotItems,
        floor: updatedOrder.order.floor,
        kotId: updatedOrder.order.kotId,
        tableNumber: updatedOrder.order.tableNumber,

        waiterName: updatedOrder.order.waiterName
      })
      setOpenModal(true) // Open modal for KOT print preview

      // Refresh to reflect updates
      setRefresh(prev => !prev)
    } catch (error) {
      console.error('Error updating KOT:', error)
    } finally {
      setIsUpdatingKOT(false) // Stop loading
    }
  }

  // Use useReactToPrint to handle auto-printing of the updated KOT
  const handlePrintUpdatedKOT = useReactToPrint({
    content: () => document.getElementById('printable-kot'),
    documentTitle: 'Updated KOT',
    onAfterPrint: () => alert('Updated KOT printed successfully!')
  })

  // Ensure the print is triggered when the modal is opened

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (kotToPrint && openModal) {
      handlePrintUpdatedKOT()
    }
  }, [kotToPrint, openModal])

  const generateKOT = async () => {
    if (kotItems.length === 0) {
      console.error('No items in KOT')
      return
    }

    setIsGeneratingKOT(true) // Start loading

    try {
      // Fetch the next KOT ID from the server
      const response = await fetch('/api/nextKotId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get next KOT ID')
      }

      const data = await response.json()
      const nextKotId = data.nextKotId

      // Calculate the total amount based on the KOT items
      const totalAmount = kotItems.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)

      const newKOT = {
        userId: user.id,
        kotId: nextKotId,
        items: kotItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          quantity: parseInt(item.quantity, 10),
          unitPrice: item.price,
          total: item.price * item.quantity
        })),
        floor,
        tableNumber,
        waiterName,
        totalAmount
      }

      const kotResponse = await fetch('/api/kot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newKOT)
      })

      if (!kotResponse.ok) {
        throw new Error('Failed to generate KOT')
      }

      const kotData = await kotResponse.json()
      console.log('KOT generated successfully:', kotData)

      // Clear the current KOT items and reset states
      setKotItems([])
      setWaiterName('')
      setTableNumber('')
      setFloor('Roof Top')

      // Trigger a refresh to re-fetch the pending KOTs and latest KOT ID
      setRefresh(prev => !prev)

      // Optionally, you can update the currentKOTId state here
      setCurrentKOTId(nextKotId + 1)

      setIsGeneratingKOT(false) // Stop loading after successful response
    } catch (error) {
      console.error('Error generating KOT:', error)

      setIsGeneratingKOT(false) // Stop loading if there’s an error
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  }

  // Add this function to close the modal for KOT
  const handleCloseModal = () => {
    setOpenModal(false) // Close the KOT modal
  }

  // Add this function to close the bill modal
  const handleCloseBillModal = () => {
    setOpenBillModal(false) // Close the Bill modal
  }

  // PAYMENT
  // PAYMENT
  const handlePaymentModalOpen = () => {
    setOpenPaymentModal(true)
  }

  const handlePaymentModalClose = () => {
    setOpenPaymentModal(false)
  }

  // Update the finalizePayment function to be simpler
  const finalizePayment = () => {
    // Calculate the totals
    const subtotal = billToPrint.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const gst = subtotal * 0.13
    const serviceTax = subtotal * 0.03
    const discountAmount = billToPrint.discount || 0
    const netTotal = subtotal + gst + serviceTax - discountAmount

    let finalPaymentDetails = {}

    if (paymentMethod === 'Room Pay') {
      finalPaymentDetails = {
        method: 'Room Pay',
        guestName: guestName,
        checkInId: selectedRoom,
        roomNumber: availableRooms.find(room => room.checkInId === selectedRoom)?.roomName
      }
    } else if (paymentMethod === 'Cash') {
      const cashReceived = Number(cashPaid)
      if (cashReceived < netTotal) {
        alert('Cash paid is less than the total amount. Please provide sufficient cash.')
        return
      }
      finalPaymentDetails = {
        method: 'Cash',
        cashPaid: cashReceived,
        returnCash: cashReceived - netTotal
      }
    } else if (paymentMethod === 'Card') {
      finalPaymentDetails = {
        method: 'Card',
        transactionNumber: transactionNumber
      }
    }

    handleFinalizePayment({
      totalAmount: subtotal,
      discount: discountAmount,
      gst: gst.toFixed(2),
      serviceTax: serviceTax.toFixed(2),
      netAmount: netTotal,
      paymentDetails: finalPaymentDetails,
      generatedBy: {
        id: user.id,
        name: user.name
      }
    })
  }

  const handleFinalizePayment = async paymentData => {
    setIsFinalizingPayment(true)

    try {
      const response = await fetch('/api/updatebills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: billToPrint.bill.id,
          ...paymentData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update bill')
      }

      const result = await response.json()
      console.log('Update Response:', result)

      // Update the bill to print with the payment details
      setBillToPrint(prevBill => ({
        ...prevBill,
        ...paymentData
      }))

      setOpenBillModal(true)
      handlePaymentModalClose()

      // Reset all payment-related states
      setDiscountPercent(0)
      setIsDiscountApplied(false)
      setCashPaid('')
      setReturnCash('')
      setTransactionNumber('')
      setPaymentMethod(null)
      setGuestName('')
      setSelectedRoom(null)
      setAvailableRooms([])
    } catch (error) {
      console.error('Error finalizing payment:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setIsFinalizingPayment(false)
    }
  }
  const handlePrintBill = async () => {
    // Assuming `kotId` is available when generating the bill
    const kotData = await fetchKOTData(kotId)
    if (!kotData) return // Handle error as needed

    const billToPrint = {
      ...kotData, // Spread the KOT data to include all relevant fields
      paymentDetails: {
        method: paymentMethod,
        cashPaid,
        returnCash,
        transactionNumber
      },
      generatedBy: {
        id: user.id,
        name: user.name
      },
      floor,
      waiter: waiterName
    }

    setBillToPrint(billToPrint) // Set the final bill with KOT data to print
    setOpenBillModal(true) // Open the bill modal
  }

  const markKOTAsCompleted = kotId => {
    const updatedKOTs = pendingKOTs.map(kot => {
      if (kot.id === kotId) {
        return { ...kot, status: 'Completed' }
      }
      return kot
    })

    setPendingKOTs(updatedKOTs)
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current, // Point to the content inside printRef
    documentTitle: 'KOT Print',
    onAfterPrint: () => alert('Print Success!') // Optional: After print event
  })

  const handleDone = () => {
    const printContent = document.getElementById('printable-kot').innerHTML // Get the HTML content to print
    const printWindow = window.open('', '', 'width=800,height=600') // Open a new window for the print content
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT Print</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid black; padding: 8px; text-align: left; }
            /* th { background-color: #f2f2f2; } */
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `) // Write the HTML content to the new window
    printWindow.document.close() // Close the document to signal to the browser the content is ready
    printWindow.focus() // Focus the print window
    printWindow.print() // Trigger the browser's print dialog
    printWindow.close() // Close the print window after printing

    handleCloseModal() // Close the modal after print
  }

  const handleDoneBill = () => {
    const printContent = document.getElementById('printable-bill').innerHTML // Get the HTML content to print
    const printWindow = window.open('', '', 'width=800,height=600') // Open a new window for the print content
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Print</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `) // Write the HTML content to the new window
    printWindow.document.close() // Close the document to signal to the browser the content is ready
    printWindow.focus() // Focus the print window
    printWindow.print() // Trigger the browser's print dialog
    printWindow.close() // Close the print window after printing

    handleCloseBillModal() // Close the modal after print
  }

  return (
    <div className='shadow-lg px-6 py-6 rounded-md'>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your User ID: {user?.id}</p>
      <p>Your Role: {role}</p>
      <Typography variant='h4'>Bill Generator</Typography>
      <Grid container spacing={6} className=' mt-4'>
        <Grid item xs={12} md={6}>
          <Typography variant='h6'>Add Dishes to KOT</Typography>
          <KOTForm
            waiterName={waiterName}
            setWaiterName={setWaiterName}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            floor={floor}
            setFloor={setFloor}
            dishCode={dishCode}
            handleDishCodeChange={handleDishCodeChange}
            currentItem={currentItem}
            quantity={quantity}
            setQuantity={setQuantity}
            addItemToKOT={addItemToKOT}
          />

          <Button
            variant='contained'
            color='primary'
            onClick={generateKOT}
            disabled={isGeneratingKOT || kotItems.length === 0} // Disable when loading or no items
          >
            {isGeneratingKOT ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Generate KOT'}
          </Button>

          {kotItems.length > 0 && <KOTItemsTable kotItems={kotItems} />}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant='h6'>Pending KOTs</Typography>
          {pendingKOTs.length > 0 && (
            <PendingKOT
              pendingKOTs={pendingKOTs}
              markKOTAsCompleted={markKOTAsCompleted}
              handlePaymentModalOpen={handlePaymentModalOpen}
              printKOT={printKOT}
              printBill={printBill}
              handleOpenUpdateModal={handleOpenUpdateModal}
              MakeDone={MakeDone}
            />
          )}
        </Grid>
      </Grid>
      {/* Modal for KOT display before printing */}
      {/* Modal for KOT display before printing */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby='print-modal-title'
        aria-describedby='print-modal-description'
      >
        <Box sx={modalStyle}>
          <Typography id='print-modal-title' variant='h6' component='h2'>
            Print KOT Preview
          </Typography>
          {kotToPrint && (
            <div>
              {/* Log the KOT data to the console for debugging */}
              {console.log('KOT to Print:', kotToPrint)}

              {/* Render the KOTPrintComponent in the modal */}
              <div id='printable-kot'>
                <KOTPrintComponent kot={kotToPrint} />
              </div>
              <Button variant='contained' color='primary' onClick={handleDone} style={{ marginTop: '20px' }}>
                Done
              </Button>
            </div>
          )}
        </Box>
      </Modal>

      {/* // Modal for Bill display before printing */}
      {/* Modal for Bill display before printing */}
      <Modal
        open={openBillModal}
        onClose={handleCloseBillModal}
        aria-labelledby='print-bill-modal-title'
        aria-describedby='print-bill-modal-description'
      >
        <Box sx={modalStyle}>
          <Typography id='print-bill-modal-title' variant='h6' component='h2'>
            Print Bill Preview
          </Typography>

          {billToPrint && (
            <div>
              {/* Log the bill data to the console for debugging */}
              {console.log('Bill to Print:', billToPrint)}

              {/* Render the BillPrintComponent in the modal */}
              <div id='printable-bill'>
                <BillPrintComponent bill={billToPrint} />
              </div>

              {/* Add discount input for admins */}
              {role === 'ADMIN' && (
                <div>
                  <TextField
                    label='Discount (%)'
                    type='number'
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    variant='outlined'
                    margin='normal'
                    fullWidth
                  />
                  <Button variant='contained' color='primary' onClick={applyDiscount} disabled={isDiscountApplied}>
                    Apply Discount
                  </Button>
                </div>
              )}

              <Button variant='contained' color='primary' onClick={handleDoneBill} style={{ marginTop: '20px' }}>
                Done
              </Button>
            </div>
          )}
        </Box>
      </Modal>

      {/* LAST MODEL  */}
      <Modal
        open={openPaymentModal}
        onClose={handlePaymentModalClose}
        aria-labelledby='payment-modal-title'
        aria-describedby='payment-modal-description'
      >
        <Box sx={modalStyle}>
          <Typography id='payment-modal-title' variant='h6' component='h2'>
            Select Payment Method
          </Typography>

          <Button
            variant='contained'
            onClick={() => setPaymentMethod('Cash')}
            style={{
              backgroundColor: '#A259FF',
              color: 'white',
              marginRight: '10px',
              marginTop: '20px',
              width: '100px'
            }}
          >
            Cash
          </Button>
          <Button
            variant='contained'
            onClick={() => setPaymentMethod('Card')}
            style={{
              backgroundColor: '#BDBDBD',
              color: 'white',
              marginRight: '10px',
              marginTop: '20px',
              width: '100px'
            }}
          >
            Card
          </Button>
          <Button
            variant='contained'
            onClick={() => setPaymentMethod('Room Pay')}
            style={{
              backgroundColor: '#FFD700',
              color: 'white',
              marginTop: '20px',
              width: '100px'
            }}
          >
            Room Pay
          </Button>

          {/* Cash Payment */}
          {paymentMethod === 'Cash' && (
            <div>
              <Typography variant='body1'>Enter Cash Paid:</Typography>
              <TextField
                label='Cash Paid'
                type='number'
                variant='outlined'
                fullWidth
                value={cashPaid}
                onChange={e => setCashPaid(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === 'Card' && (
            <div>
              <Typography variant='body1'>Enter Transaction Number:</Typography>
              <TextField
                label='Transaction Number'
                type='text'
                variant='outlined'
                fullWidth
                value={transactionNumber}
                onChange={e => setTransactionNumber(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
            </div>
          )}

          {/* Room Pay Option */}
          {paymentMethod === 'Room Pay' && (
            <div>
              <TextField
                label='Guest Name'
                type='text'
                variant='outlined'
                fullWidth
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <Button variant='contained' onClick={handleRoomPay}>
                Find Rooms
              </Button>

              {availableRooms.length > 0 && (
                <Select
                  fullWidth
                  value={selectedRoom}
                  onChange={e => setSelectedRoom(e.target.value)}
                  displayEmpty
                  style={{ marginTop: '10px' }}
                >
                  <MenuItem value='' disabled>
                    Select Room
                  </MenuItem>
                  {availableRooms.map(room => (
                    <MenuItem key={room.id} value={room.checkInId}>
                      {room.roomName} - {room.roomType}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </div>
          )}

          {/* Finalize Payment Button */}
          <Button
            variant='contained'
            onClick={finalizePayment}
            style={{
              backgroundColor: '#A259FF',
              color: 'white',
              marginTop: '20px',
              width: '150px'
            }}
            disabled={isFinalizingPayment}
          >
            {isFinalizingPayment ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Finalize Payment'}
          </Button>
        </Box>
      </Modal>
      <div>
        {/* Existing code for rendering UI */}

        {/* Update Modal */}
        {/* Update Modal */}
        <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
          <Box sx={{ ...modalStyle }}>
            <Typography variant='h6'>Update KOT</Typography>
            {selectedKOT && (
              <>
                <KOTForm
                  waiterName={selectedKOT.waiterName}
                  setWaiterName={() => {}}
                  tableNumber={selectedKOT.tableNumber}
                  setTableNumber={() => {}}
                  floor={selectedKOT.floor}
                  setFloor={() => {}}
                  dishCode={dishCode}
                  handleDishCodeChange={handleDishCodeChange}
                  currentItem={currentItem}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  addItemToKOT={addItemToNewKOT} // Add item to new KOT list
                />
                <KOTList kotItems={newKotItems} />

                {/* This button triggers handleUpdateKOT */}
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleUpdateKOT}
                  fullWidth
                  disabled={isUpdatingKOT} // Disable button when loading
                >
                  {isUpdatingKOT ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Update and Print KOT'}
                </Button>
              </>
            )}
          </Box>
        </Modal>

        {/* KOT Print Preview */}
        {kotToPrint && (
          <div id='printable-kot' style={{ display: 'none' }}>
            <KOTPrintComponent kot={kotToPrint} />
          </div>
        )}
      </div>

      {/* {kotToPrint && <KOTPrintComponent ref={printRef} kot={kotToPrint} />} */}
      {bill && <BillDisplay bill={bill} />}
    </div>
  )
}

export default BillGenerator
