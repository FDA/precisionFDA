import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../../utils/config'
import { Notification, NOTIFICATION_ACTION, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../../home/types'

const useLastWebsocketMessage = () => {
  const queryClient = useQueryClient()
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
          messageData.type === WEBSOCKET_MESSAGE_TYPE.NOTIFICATION &&
          [
            NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
            NOTIFICATION_ACTION.USER_PROVISIONING_ERROR,
            NOTIFICATION_ACTION.ALL_USER_PROVISIONINGS_COMPLETED,
          ].includes(notification.action)
        )
      } catch {
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryClient.invalidateQueries({
      queryKey: ['admin-invitations'],
    })
  }, [lastJsonMessage])
}

export default useLastWebsocketMessage
