import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import UpgradeToProButton from '@components/upgrade-to-pro-button'
import { getSettingsFromCookie } from '@core/utils/serverHelpers'
import themeConfig from '@/configs/themeConfig'

const Providers = ({ children, direction }) => {
  const settingsCookie = getSettingsFromCookie() || themeConfig

  return (
    <VerticalNavProvider>
      <SettingsProvider settingsCookie={settingsCookie} mode={themeConfig.mode}>
        <ThemeProvider direction={direction} themeConfig={themeConfig}>
          {children}
          <UpgradeToProButton />
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
  )
}

export default Providers

// // Context Imports
// import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
// import { SettingsProvider } from '@core/contexts/settingsContext'
// import ThemeProvider from '@components/theme'

// // Component Imports
// import UpgradeToProButton from '@components/upgrade-to-pro-button'

// // Util Imports
// import { getMode, getSettingsFromCookie } from '@core/utils/serverHelpers'

// const Providers = props => {
//   // Props
//   const { children, direction } = props

//   // Vars
//   const mode = getMode()
//   const settingsCookie = getSettingsFromCookie()

//   return (
//     <VerticalNavProvider>
//       <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
//         <ThemeProvider direction={direction}>
//           {children}
//           <UpgradeToProButton />
//         </ThemeProvider>
//       </SettingsProvider>
//     </VerticalNavProvider>
//   )
// }

// export default Providers
