import React, { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthUser } from './features/auth/useAuthUser'
import { useModal } from './features/modal/useModal'
import PublicLayout from './layouts/PublicLayout'
import NavigationBar, { NavigationBarBanner, NavigationBarPublicLandingTitle } from './components/NavigationBar/NavigationBar'
import { PageContainerMargin } from './components/Page/styles'
import { PageLoaderWrapper } from './components/Public/styles'
import { LayoutLoader } from './layouts/UserLayout'
import { AuthPickerModal } from './features/auth/AuthPickerModal'

// To be used for the pages which require authentication
// If unauthenticated, the user is presented with modal with login options
const AuthWall: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { loading, user } = useAuthUser(true)
  const modal = useModal()

  if (!user && !loading) {
    // if accessed as non-logged user, present modal with landing-page background
    return (
      <PublicLayout mainScroll={!!user}>
        <AuthPickerModal modal={modal} />
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
