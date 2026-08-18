import type React from 'react'
import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import NavigationBar, {
  NavigationBarBanner,
  NavigationBarPublicLandingTitle,
} from './components/NavigationBar/NavigationBar'
import { PageContainerMargin } from './components/Page/page.styles'
import { PageLoaderWrapper } from './components/Public/public-layout.styles'
import { AuthPickerModal } from './features/auth/AuthPickerModal'
import { useAuthUser } from './features/auth/useAuthUser'
import PublicLayout from './layouts/PublicLayout'
import { LayoutLoader } from './layouts/UserLayout'

// To be used for the pages which require authentication
// If unauthenticated, the user is presented with modal with login options
const AuthWall: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { loading, user } = useAuthUser(true)

  if (!user && !loading) {
    // if accessed as non-logged user, present modal with landing-page background
    return (
      <PublicLayout mainScroll={!!user}>
        <AuthPickerModal />
        <NavigationBar user={null}>
          <PageContainerMargin>
            <NavigationBarBanner>
              <NavigationBarPublicLandingTitle />
            </NavigationBarBanner>
          </PageContainerMargin>
        </NavigationBar>
        <div style={{ height: '100%' }} />
      </PublicLayout>
    )
  }

  return loading ? (
    <PageLoaderWrapper>
      <LayoutLoader />
    </PageLoaderWrapper>
  ) : (
    children || <Outlet />
  )
}

export default AuthWall
