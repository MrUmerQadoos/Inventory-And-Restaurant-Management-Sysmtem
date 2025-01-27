'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  CircularProgress,
  Box
} from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'
import { userLogin } from '../store/user/userThunk'

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, role } = useSelector(state => state.user) // Get role from Redux state

  useEffect(() => {
    if (error) {
      toast.error('Invalid email or password. Please try again.')
    }
  }, [error])

  // Handle password visibility toggle
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    dispatch(
      userLogin({
        email,
        password,
        onSuccess: () => {
          toast.success('Login successful!')
        }
      })
    )
  }

  // Redirect user based on their role after login
  // Redirect user based on their role after login
  useEffect(() => {
    if (role?.toLowerCase() === 'admin') {
      router.push('/admin/dashboard')
    } else if (role?.toLowerCase() === 'receptionist') {
      router.push('/receptionist/dashboard')
    }
  }, [role, router])

  return (
    <div className='flex flex-col justify-center items-center min-h-screen relative p-6'>
      <Toaster />
      <Card className='flex flex-col sm:w-[450px] relative'>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <CardContent className='p-6 sm:p-12 relative'>
          <div className='flex justify-center items-center mb-6'>
            <Typography variant='h4'>{`Welcome Back! 👋🏻`}</Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <TextField
              autoFocus
              fullWidth
              label='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              label='Password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={e => e.preventDefault()}
                      disabled={loading}
                    >
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login

// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useDispatch, useSelector } from 'react-redux'
// import {
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   IconButton,
//   InputAdornment,
//   Button,
//   CircularProgress,
//   Box,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl
// } from '@mui/material'
// import { userLogin } from '@/store/user/userThunk'
// import toast, { Toaster } from 'react-hot-toast'
// import Link from '@/components/Link'

// const Login = () => {
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [role, setRole] = useState('Admin') // Set default role to Admin
//   const dispatch = useDispatch()
//   const router = useRouter()
//   const { loading, error } = useSelector(state => state.user)

//   useEffect(() => {
//     if (error) {
//       toast.error('Invalid email or password. Please try again.')
//     }
//   }, [error])

//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

//   const handleSubmit = async e => {
//     e.preventDefault()

//     dispatch(
//       userLogin({
//         email,
//         password,
//         role, // Pass role in the login request
//         onSuccess: () => {
//           if (role === 'Admin') {
//             router.push('/admin-dashboard')
//           } else {
//             router.push('/reception-dashboard')
//           }
//           toast.success('Login successful!')
//         }
//       })
//     )
//   }

//   return (
//     <div className='flex flex-col justify-center items-center min-h-screen relative p-6'>
//       <Toaster />
//       <Card className='flex flex-col sm:w-[450px] relative'>
//         {loading && (
//           <Box
//             sx={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               zIndex: 10,
//               backgroundColor: 'rgba(255, 255, 255, 0.8)'
//             }}
//           >
//             <CircularProgress />
//           </Box>
//         )}
//         <CardContent className='p-6 sm:p-12 relative'>
//           <div className='flex justify-center items-center mb-6'>
//             <Typography variant='h4'>{`Welcome Back! 👋🏻`}</Typography>
//           </div>

//           <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
//             <TextField
//               autoFocus
//               fullWidth
//               label='Email'
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               disabled={loading}
//             />
//             <TextField
//               fullWidth
//               label='Password'
//               type={isPasswordShown ? 'text' : 'password'}
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               disabled={loading}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position='end'>
//                     <IconButton
//                       size='small'
//                       edge='end'
//                       onClick={handleClickShowPassword}
//                       onMouseDown={e => e.preventDefault()}
//                       disabled={loading}
//                     >
//                       <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//             />

//             {/* Role Selection Dropdown */}
//             <FormControl fullWidth>
//               <InputLabel id='role-label'>Role</InputLabel>
//               <Select
//                 labelId='role-label'
//                 value={role}
//                 onChange={e => setRole(e.target.value)}
//                 label='Role'
//                 disabled={loading}
//               >
//                 <MenuItem value='Admin'>Admin</MenuItem>
//                 <MenuItem value='Receptionist'>Receptionist</MenuItem>
//               </Select>
//             </FormControl>

//             <Button fullWidth variant='contained' type='submit' disabled={loading}>
//               Log In
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default Login

// // 'use client'
// // import { useState, useEffect } from 'react'
// // import { useRouter } from 'next/navigation'
// // import { useDispatch, useSelector } from 'react-redux'
// // import {
// //   Card,
// //   CardContent,
// //   Typography,
// //   TextField,
// //   IconButton,
// //   InputAdornment,
// //   Button,
// //   CircularProgress,
// //   Box
// // } from '@mui/material'
// // import { userLogin } from '@/store/user/userThunk'
// // import toast, { Toaster } from 'react-hot-toast'
// // import Link from '@/components/Link'

// // const Login = () => {
// //   const [isPasswordShown, setIsPasswordShown] = useState(false)
// //   const [email, setEmail] = useState('')
// //   const [password, setPassword] = useState('')
// //   const dispatch = useDispatch()
// //   const router = useRouter()
// //   const { loading, error } = useSelector(state => state.user) // Adjust selector to match your state

// //   useEffect(() => {
// //     if (error) {
// //       toast.error('Invalid email or password. Please try again.')
// //     }
// //   }, [error])

// //   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

// //   const handleSubmit = async e => {
// //     e.preventDefault()

// //     dispatch(
// //       userLogin({
// //         email,
// //         password,
// //         onSuccess: () => {
// //           router.push('/main')
// //           toast.success('Login successful!')
// //         }
// //       })
// //     )
// //   }

// //   return (
// //     <div className='flex flex-col justify-center items-center min-h-screen relative p-6'>
// //       <Toaster />
// //       <Card className='flex flex-col sm:w-[450px] relative'>
// //         {loading && (
// //           <Box
// //             sx={{
// //               position: 'absolute',
// //               top: 0,
// //               left: 0,
// //               right: 0,
// //               bottom: 0,
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               zIndex: 10,
// //               backgroundColor: 'rgba(255, 255, 255, 0.8)'
// //             }}
// //           >
// //             <CircularProgress />
// //           </Box>
// //         )}
// //         <CardContent className='p-6 sm:p-12 relative'>
// //           <div className='flex justify-center items-center mb-6'>
// //             <Typography variant='h4'>{`Welcome Back! 👋🏻`}</Typography>
// //           </div>

// //           <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
// //             <TextField
// //               autoFocus
// //               fullWidth
// //               label='Email'
// //               value={email}
// //               onChange={e => setEmail(e.target.value)}
// //               disabled={loading}
// //             />
// //             <TextField
// //               fullWidth
// //               label='Password'
// //               type={isPasswordShown ? 'text' : 'password'}
// //               value={password}
// //               onChange={e => setPassword(e.target.value)}
// //               disabled={loading}
// //               InputProps={{
// //                 endAdornment: (
// //                   <InputAdornment position='end'>
// //                     <IconButton
// //                       size='small'
// //                       edge='end'
// //                       onClick={handleClickShowPassword}
// //                       onMouseDown={e => e.preventDefault()}
// //                       disabled={loading}
// //                     >
// //                       <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
// //                     </IconButton>
// //                   </InputAdornment>
// //                 )
// //               }}
// //             />
// //             <Button fullWidth variant='contained' type='submit' disabled={loading}>
// //               Log In
// //             </Button>
// //           </form>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   )
// // }

// // export default Login
