import React from 'react'
import { Button, Card, CardContent, Typography } from '@mui/material'

const PendingKOT = ({
  pendingKOTs,
  markKOTAsCompleted,
  handleOpenUpdateModal, // Add this prop
  MakeDone,
  handlePaymentModalOpen,
  printKOT,
  printBill
}) => {
  return (
    <div>
      {pendingKOTs.map(kot => (
        <Card key={kot.kotId} style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant='h5'>KOT ID: {kot.kotId}</Typography>
            <Typography>Table No: {kot.tableNumber}</Typography>
            <Typography>Waiter Name: {kot.waiterName}</Typography>
            <Typography>Status: {kot.status}</Typography>
            <Typography variant='subtitle1'>Items:</Typography>
            {kot.items.map((item, index) => (
              <Typography key={index}>
                {item.name} - Quantity: {item.quantity}
              </Typography>
            ))}

            <div style={{ marginTop: '10px' }}>
              {kot.status === 'PENDING' ? (
                <>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => markKOTAsCompleted(kot.id)}
                    style={{ marginRight: '10px' }}
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => printKOT(kot)}
                    style={{ marginRight: '10px' }}
                  >
                    Print KOT
                  </Button>
                  <Button variant='contained' color='primary' onClick={() => handleOpenUpdateModal(kot)}>
                    Update
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handlePaymentModalOpen}
                    style={{ marginRight: '10px' }}
                  >
                    Payment Done
                  </Button>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => printBill(kot)}
                    style={{ marginRight: '10px' }}
                  >
                    Print Bill
                  </Button>
                  <Button variant='contained' color='secondary' onClick={() => MakeDone(kot)}>
                    Done
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PendingKOT
