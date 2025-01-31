// Layout Imports

import LayoutWrapper from '@layouts/LayoutWrapper'

import VerticalLayout from '@layouts/VerticalLayout'

// Component Imports

import ProviderStore from '@/store/ProviderStore'

import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'

const Layout = async ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <ProviderStore>
      <Providers direction={direction}>
        <LayoutWrapper
          verticalLayout={
            <VerticalLayout navigation={<Navigation />} navbar={<Navbar />} footer={<VerticalFooter />}>
              {children}
            </VerticalLayout>
          }
        />
      </Providers>
    </ProviderStore>
  )
}

export default Layout
