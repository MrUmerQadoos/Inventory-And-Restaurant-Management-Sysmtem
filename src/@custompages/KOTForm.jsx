import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

const KOTForm = ({
  waiterName,
  setWaiterName,
  tableNumber,
  setTableNumber,
  floor,
  setFloor,
  dishCode,
  handleDishCodeChange,
  currentItem,
  quantity,
  setQuantity,
  addItemToKOT
}) => {
  return (
    <>
      <Grid container spacing={3} alignItems='center' className='mt-[2px]'>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label='Table Number'
            value={tableNumber}
            onChange={e => setTableNumber && setTableNumber(e.target.value)}
            placeholder='Enter Table Number'
            InputProps={{
              readOnly: !setTableNumber // If no setTableNumber prop, make it read-only
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label='Waiter Name'
            value={waiterName}
            onChange={e => setWaiterName && setWaiterName(e.target.value)}
            placeholder='Enter Waiter Name'
            InputProps={{
              readOnly: !setWaiterName // If no setWaiterName prop, make it read-only
            }}
          />
        </Grid>

        <Grid item xs={6} className='mt-[2px]'>
          <FormControl fullWidth>
            <InputLabel id='floor-label'>Floor</InputLabel>
            <Select
              labelId='floor-label'
              value={floor}
              onChange={e => setFloor && setFloor(e.target.value)}
              label='Floor'
              disabled={!setFloor} // Disable if setFloor is not provided
            >
              <MenuItem value='Roof Top'>Roof Top</MenuItem>
              <MenuItem value='Ground'>Ground</MenuItem>
              <MenuItem value='Basement'>Basement</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems='center' className='mt-[2px]'>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label='Dish Code'
            value={dishCode}
            onChange={e => handleDishCodeChange(e.target.value)}
            placeholder='Enter Dish Code'
          />
        </Grid>
        <Grid item xs={6} className='mt-[2px]'>
          <TextField fullWidth label='Item Name' value={currentItem ? currentItem.name : ''} disabled />
        </Grid>
        <Grid item xs={6} className='mt-[2px]'>
          <TextField
            fullWidth
            label='Quantity'
            type='number'
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} className='mt-[2px]'>
          <Button variant='contained' onClick={addItemToKOT} disabled={!currentItem || quantity <= 0}>
            Add Item
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default KOTForm
