import React from 'react'
import { useParams } from 'react-router-dom'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { useDataPortalByIdQuery } from '../queries'
import { DataPortalNotFound } from './DataPortalNotFound'

import '../../lexi/themes/PlaygroundEditorTheme.css'
import { canEditContent as canEditContentCheck, canEditSettings as canEditSettingsCheck } from '../utils'
import { DataPortalDetails } from './DataPortalDetails'
import { ScrollableInnerGlobalStyles } from '../../../styles/global'


const DataPortalDetailsPage = () => {
  const user = useAuthUser()
  const { portalId } = useParams<{
    portalId: string
    page?: string
  }>()
  const { data, isLoading, error } = useDataPortalByIdQuery(portalId)

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
        {isLoading || !data ? (
          <PageContainerMargin>
            <Loader />
          </PageContainerMargin>
        ) : (
          <DataPortalDetails
            portal={data}
            canViewResources={canEditContentCheck(user?.dxuser, data.members)}
            canEditContent={canEditContentCheck(user?.dxuser, data.members)}
            canEditSettings={canEditSettingsCheck(user?.dxuser, data.members)}
            canListPortals={user?.isAdmin}
          />
        )}
      </UserLayout>
    </>
  )
}

export default DataPortalDetailsPage
