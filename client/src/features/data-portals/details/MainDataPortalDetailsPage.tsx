import React from 'react'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { useMainDataPortal } from '../queries'
import { DataPortalNotFound } from './DataPortalNotFound'

import '../../lexi/themes/PlaygroundEditorTheme.css'
import { canEditContent, canEditSettings } from '../utils'
import { DataPortalDetails } from './DataPortalDetails'
import { ScrollableInnerGlobalStyles } from '../../../styles/global'


const MainDataPortalDetailsPage = () => {
  const user = useAuthUser()
  const { data, isLoading, error } = useMainDataPortal()

  if (!isLoading && !data && error) {
    return (
      <UserLayout>
        <DataPortalNotFound message={error?.response?.data?.error?.message} />
      </UserLayout>
    )
  }

  return (
    <>
      <ScrollableInnerGlobalStyles />
      <UserLayout>
        {isLoading || !data || !user ? (
          <PageContainerMargin>
            <Loader />
          </PageContainerMargin>
        ) : (
          <DataPortalDetails
            portal={data}
            canViewResources={canEditSettings(user.dxuser, data.members) || user.admin}
            canEditContent={canEditContent(user.dxuser, data.members)}
            canEditSettings={canEditSettings(user.dxuser, data.members)}
            canListPortals={user?.admin}
          />
        )}
      </UserLayout>
    </>
  )
}

export default MainDataPortalDetailsPage
