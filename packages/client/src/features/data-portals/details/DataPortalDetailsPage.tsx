import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { Loader, LoaderMargin } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../../utils/config'
import { useAuthUser } from '../../auth/useAuthUser'
import { Notification, NOTIFICATION_ACTION, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../../home/types'
import { useDataPortalByIdQuery } from '../queries'
import { DataPortalError } from './DataPortalNotFound'

import '../../lexi/themes/PlaygroundEditorTheme.css'
import { canEditContent as canEditContentCheck, canEditSettings as canEditSettingsCheck, canViewSpaceLink as canViewSpaceLinkCheck } from '../utils'
import { DataPortalDetails } from './DataPortalDetails'

const DataPortalDetailsPage = () => {
  const user = useAuthUser()
  const { portalId } = useParams<{
    portalId: string
    page?: string
  }>()

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useDataPortalByIdQuery(portalId === undefined ? 'main' : portalId)
  const navigate = useNavigate()

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const messageData = JSON.parse(message.data)
        const notification = messageData.data as Notification
        return (
          messageData.type === WEBSOCKET_MESSSAGE_TYPE.NOTIFICATION &&
          NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED === notification.action
        )
      } catch (e) {
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryClient.invalidateQueries({ queryKey: ['data-portals', portalId] })
  }, [lastJsonMessage])

  // URLs /data-portals/main and /data-portals/{id} are redirected to /data-portals/{slug}
  useEffect(() => {
    if (data !== undefined && data.urlSlug !== undefined && data.urlSlug !== portalId) {
      navigate(`/data-portals/${data.urlSlug}`, { replace: true })
    }
  }, [portalId, data, navigate])

  if (error?.response?.status === 503) {
    return (
      <UserLayout mainScroll>
        <DataPortalError message={error?.response?.data?.error.message} />
      </UserLayout>
    )
  }

  if (!isLoading && !data) {
    return (
      <UserLayout mainScroll>
        <DataPortalError message="Data Portal Not Found" />
      </UserLayout>
    )
  }

  return (
    <UserLayout innerScroll>
      {isLoading || !data ? (
        <PageContainerMargin>
          <LoaderMargin>
            <Loader />
          </LoaderMargin>
        </PageContainerMargin>
      ) : (
        <DataPortalDetails
          portal={data}
          canViewResources={canEditContentCheck(user?.dxuser, data.members)}
          canViewSpaceLink={canViewSpaceLinkCheck(user?.dxuser, data.members)}
          canEditContent={canEditContentCheck(user?.dxuser, data.members)}
          canEditSettings={canEditSettingsCheck(user?.dxuser, data.members)}
          canListPortals={user?.isAdmin}
        />
      )}
    </UserLayout>
  )
}

export default DataPortalDetailsPage
