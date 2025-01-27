import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material'

const BillDisplay = ({ bill }) => {
  return (
    <div style={{ marginTop: '30px' }}>
      <Typography variant='h6'>Generated Bill</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.price} PKR</TableCell>
                <TableCell>{item.total} PKR</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>
                <strong>Total</strong>
              </TableCell>
              <TableCell>
                <strong>{bill.totalAmount} PKR</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant='subtitle1'>
                  Waiter: {bill.waiter} | Floor: {bill.floor}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default BillDisplay
