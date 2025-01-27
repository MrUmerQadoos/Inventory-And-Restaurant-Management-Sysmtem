'use client'

import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

// import { useSession, signOut } from 'next-auth/react'

import { styled } from '@mui/material/styles'

import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import toast from 'react-hot-toast' // Import toast
import { useDispatch, useSelector } from 'react-redux'
import { userLogout } from '../../../store/user/userThunk'


const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const router = useRouter()
  const dispatch = useDispatch()
  const { authUser } = useSelector(state => state.user) // Get the user from the Redux store
  console.log(authUser, 'its aith user,')

  const handleDropdownOpen = () => {
    setOpen(!open)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleSignOut = async () => {
    console.log('Sign out function called')
    try {
      // Remove the token from localStorage
      localStorage.removeItem('authToken')

      // Dispatch the userLogout action
      await dispatch(userLogout()).unwrap()

      // Navigate to the login page
      router.push('/login')
    } catch (error) {
      console.error('An error occurred during logout:', error)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        {/* <Avatar
          ref={anchorRef}
          alt={'Umer'}
          src={'/images/avatars/user.jpg'}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        /> */}
      </Badge>
      <div className='flex items-center plb-2 pli-4'>
        <Button
          fullWidth
          variant='contained'
          color='error'
          size='small'
          endIcon={<i className='ri-logout-box-r-line' />}
          onClick={handleSignOut} // Use the handleSignOut function
          sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
        >
          Logout
        </Button>
      </div>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                {/* <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={'User'} src={'/images/avatars/user.jpg'} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {'User'}
                      </Typography>
                      <Typography variant='caption'>{'Admin'}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-money-dollar-circle-line' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem>
                </MenuList> */}
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
