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
        {/* Admin Menu */}
        {role.toLowerCase() === 'admin' && (
          <>
            <MenuItem href='/admin/dashboard' icon={<i className='ri-home-smile-line' />}>
              Dashboard
            </MenuItem>

            <MenuItem href={`/createusers`}>User Management</MenuItem>

            <MenuItem href={`/inventory`}>Inventory Management</MenuItem>
            <MenuItem href={`/product`}>Menu Items</MenuItem>
            <MenuItem href={`/salary`}>Employees</MenuItem>
            <MenuItem href={`/salarymanagement`}>Salary Management</MenuItem>
            <MenuItem href={`/overhead`}>Overhead Expenses</MenuItem>
            <MenuItem href={`/inventoryrecord`}>Add Inventory </MenuItem>
            <MenuItem href={`/checkcustomer`}>Customer Database</MenuItem>
            <MenuItem href={`/orderlist`}>Orders Database</MenuItem>

            <MenuItem href={`/invoice`}>Reports</MenuItem>
            <MenuItem href={`/productinvoice`}>Create Invoice</MenuItem>
          </>
        )}

        {/* Receptionist Menu - Only Show "Create Invoice" */}
        {role.toLowerCase() === 'receptionist' && (
          <>
            <MenuItem href='/receptionist/dashboard' icon={<i className='ri-home-smile-line' />}>
              Reception Dashboard
            </MenuItem>

            <MenuItem href={`/productinvoice`}>Create Invoice</MenuItem>
          </>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu

// import { useEffect } from 'react'
// import { useSelector } from 'react-redux'
// import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'
// import PerfectScrollbar from 'react-perfect-scrollbar'
// import useVerticalNav from '@menu/hooks/useVerticalNav'
// import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// import { useTheme } from '@mui/material/styles'
// import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// const VerticalMenu = ({ scrollMenu }) => {
//   const theme = useTheme()
//   const { isBreakpointReached, transitionDuration } = useVerticalNav()
//   const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

//   // Get the user's role from Redux (or another source)
//   const { role, loading } = useSelector(state => state.user) // Add loading if it's part of your state

//   // Log the role to the console for debugging
//   useEffect(() => {
//     console.log('MY role:', role)
//   }, [role])

//   // Handle loading or when the role is not available yet
//   if (!role) {
//     return (
//       <div className=' flex justify-center items-center'>
//         <p>Loading menu...</p>
//       </div>
//     )
//   }

//   return (
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
//       <Menu
//         menuItemStyles={menuItemStyles(theme)}
//         renderExpandIcon={({ open }) => (
//           <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration} />
//         )}
//         renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
//         menuSectionStyles={menuSectionStyles(theme)}
//       >
//         {role.toLowerCase() === 'admin' && (
//           <>
//             <MenuItem href='/admin/dashboard' icon={<i className='ri-home-smile-line' />}>
//               Dashboard
//             </MenuItem>

//             <MenuItem href={`/createusers`}>Create Users</MenuItem>

//             <MenuItem href={`/inventory`}>Add Inventory</MenuItem>
//             <MenuItem href={`/product`}> Add Products</MenuItem>
//             <MenuItem href={`/salary`}>Add Salary</MenuItem>
//             <MenuItem href={`/salarymanagement`}>Manage Salary</MenuItem>
//             <MenuItem href={`/overhead`}>Overhead Expense</MenuItem>
//             <MenuItem href={`/invoice`}>Analytics</MenuItem>
//             <MenuItem href={`/productinvoice`}>Create Invoice</MenuItem>
//           </>
//         )}

//         {role.toLowerCase() === 'receptionist' && (
//           <>
//             <MenuItem href='/receptionist/dashboard' icon={<i className='ri-home-smile-line' />}>
//               Reception Dashboard
//             </MenuItem>
//           </>
//         )}

//         {/* Shared pages for both roles */}
//       </Menu>
//     </ScrollWrapper>
//   )
// }

// export default VerticalMenu
