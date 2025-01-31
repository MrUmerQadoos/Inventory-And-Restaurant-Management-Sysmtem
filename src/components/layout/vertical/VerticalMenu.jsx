import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'
import PerfectScrollbar from 'react-perfect-scrollbar'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import { useTheme } from '@mui/material/styles'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const VerticalMenu = ({ scrollMenu }) => {
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Get the user's role from Redux (or another source)
  const { role, loading } = useSelector(state => state.user) // Add loading if it's part of your state

  // Log the role to the console for debugging
  useEffect(() => {
    console.log('MY role:', role)
  }, [role])

  // Handle loading or when the role is not available yet
  if (!role) {
    return (
      <div className=' flex justify-center items-center'>
        <p>Loading menu...</p>
      </div>
    )
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => (
          <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        {role.toLowerCase() === 'admin' && (
          <>
            <MenuItem href='/admin/dashboard' icon={<i className='ri-home-smile-line' />}>
              Dashboard
            </MenuItem>

            <SubMenu label='Resturent ' icon={<i className='ri-file-copy-line' />}>
              <MenuItem href={`/createusers`}>Create Users</MenuItem>
              <MenuItem href={`/AddDishes`}> Add Dishes</MenuItem>
              <MenuItem href={`/bills`}>Bills</MenuItem>
              <MenuItem href={`/dailyReport`}>Daily Report</MenuItem>
              <MenuItem href={`/deletebill`}>Delete Bills</MenuItem>
            </SubMenu>

            <SubMenu label='Inventory ' icon={<i className='ri-file-copy-line' />}>
              <MenuItem href={`/inventory`}>Add Inventory</MenuItem>
              <MenuItem href={`/product`}> Add Products</MenuItem>
              <MenuItem href={`/salary`}>Add Salary</MenuItem>
              <MenuItem href={`/salarymanagement`}>Manage Salary</MenuItem>
              <MenuItem href={`/overhead`}>Overhead Expense</MenuItem>
              <MenuItem href={`/invoice`}>Create Invoice</MenuItem>
              <MenuItem href={`/productinvoice`}>Product Invoice</MenuItem>
            </SubMenu>
          </>
        )}

        {role.toLowerCase() === 'receptionist' && (
          <>
            <MenuItem href='/receptionist/dashboard' icon={<i className='ri-home-smile-line' />}>
              Reception Dashboard
            </MenuItem>
          </>
        )}

        {/* Shared pages for both roles */}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu

// // MUI Imports
// import Chip from '@mui/material/Chip'
// import { useTheme } from '@mui/material/styles'
// // Third-party Imports
// import PerfectScrollbar from 'react-perfect-scrollbar'
// // Component Imports
// import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
// // Hook Imports
// import useVerticalNav from '@menu/hooks/useVerticalNav'
// // Styled Component Imports
// import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// // Style Imports
// import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
// const RenderExpandIcon = ({ open, transitionDuration }) => (
//   <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
//     <i className='ri-arrow-right-s-line' />
//   </StyledVerticalNavExpandIcon>
// )
// const VerticalMenu = ({ scrollMenu }) => {
//   // Hooks
//   const theme = useTheme()
//   const { isBreakpointReached, transitionDuration } = useVerticalNav()
//   const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
//   return (
//     // eslint-disable-next-line lines-around-comment
//     /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
//     <ScrollWrapper
//       {...(isBreakpointReached
//         ? {
//             className: 'bs-full overflow-y-auto overflow-x-hidden',
//             onScroll: container => scrollMenu(container, false)
//           }
//         : {
//             options: { wheelPropagation: false, suppressScrollX: true },
//             onScrollY: container => scrollMenu(container, true)
//           })}
//     >
//       {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
//       {/* Vertical Menu */}
//       <Menu
//         menuItemStyles={menuItemStyles(theme)}
//         renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
//         renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
//         menuSectionStyles={menuSectionStyles(theme)}
//       >
//         <MenuItem href='/main' icon={<i className='ri-home-smile-line' />}>
//           Dashboard
//         </MenuItem>
//         {/* <MenuItem href='/' icon={<i className='ri-home-smile-line' />}> */}
//         {/* <SubMenu label='Itinerary ' icon={<i className='ri-file-copy-line' />}>
//           <MenuItem href={`/add-Itinerary`}>Manage Itinerary</MenuItem>
//           <MenuItem href={`/all-itinearary`}>All Itinerary</MenuItem>
//           <MenuItem href={`/categories`}>Type of Activity </MenuItem>
//         </SubMenu>
// <SubMenu label='Accommodations ' icon={<i className='ri-file-copy-line' />}>
//   <MenuItem href={`/add-accommodation`}>Manage Accommodation</MenuItem>
//   <MenuItem href={`/all-accommodation`}>All Accommodation</MenuItem>
//   <MenuItem href={`/accommodation-types`}>Create Accommodation Types</MenuItem>
// </SubMenu>
//         <MenuItem href='/createusers' icon={<i className='ri-home-smile-line' />}>
//           Create Users
//         </MenuItem>
//         <MenuItem href='/AddDishes' icon={<i className='ri-home-smile-line' />}>
//           Add Dishes
//         </MenuItem>
//         <MenuItem href='/bills' icon={<i className='ri-home-smile-line' />}>
//           Bills
//         </MenuItem>

//         {/* <MenuSection label='Apps & Pages'>
//           <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />}>
//             Account Settings
//           </MenuItem>
//         </MenuSection> */}
//       </Menu>
//     </ScrollWrapper>
//   )
// }
// export default VerticalMenu
