import useWebSocket from 'react-use-websocket'
import { NOTIFICATION_ACTION, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../features/home/types'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../utils/config'
import { getSessionExpiredAt } from '../utils/cookies'

export const useLastWSNotification = (filteredActions: NOTIFICATION_ACTION[] = []): WebSocketMessage => {
  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(
    getNodeWsUrl(),
    {
      share: true,
      reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
      reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
      shouldReconnect: () => SHOULD_RECONNECT,
      filter: message => {
        try {
          const messageDate = JSON.parse(message.data)
          return (
            messageDate.type === WEBSOCKET_MESSAGE_TYPE.NOTIFICATION &&
            (filteredActions.length === 0 || filteredActions.includes(messageDate.data.action))
          )
        } catch {
          return false
        }
      },
    },
    getSessionExpiredAt() > new Date(),
  )
  return lastJsonMessage
}
