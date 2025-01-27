import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

const KOTList = ({ kotItems }) =>
  kotItems.length > 0 && (
    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Dish Code</TableCell>
            <TableCell>Item Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Dining Area</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {kotItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.total} PKR</TableCell>
              <TableCell>{item.diningArea}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

export default KOTList
