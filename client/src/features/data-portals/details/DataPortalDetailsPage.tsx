import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl } from '../../../utils/config'
import { useAuthUser } from '../../auth/useAuthUser'
import { Notification, NOTIFICATION_ACTION } from '../../home/types'
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
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useDataPortalByIdQuery(portalId)

  const { lastJsonMessage: notification } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => true,
  })

  useEffect(() => {
    if (notification == null) {
      return
    }
    if (NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED === notification.action) {
      queryClient.invalidateQueries(['data-portals', portalId])
    }
  }, [notification])

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
