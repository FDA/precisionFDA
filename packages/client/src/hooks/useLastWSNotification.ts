import { type NOTIFICATION_ACTION, WEBSOCKET_MESSAGE_TYPE, type WebSocketMessage } from '@/features/home/types'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '@/utils/config'
import { getSessionExpiredAt } from '@/utils/cookies'
import { useWebSocketSelector } from './useWebSocket'

export const useLastWSNotification = (filteredActions: NOTIFICATION_ACTION[] = []): WebSocketMessage | null => {
  const { selected: lastJsonMessage } = useWebSocketSelector<WebSocketMessage, WebSocketMessage | null>(
    getNodeWsUrl(),
    {
      share: true,
      reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
      reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
      shouldReconnect: () => SHOULD_RECONNECT,
      selector: snapshot => {
        const message = snapshot.lastJsonMessage
        if (message == null || message.type !== WEBSOCKET_MESSAGE_TYPE.NOTIFICATION) {
          return null
        }

        const notification = message.data as WebSocketMessage['data'] & { action: NOTIFICATION_ACTION }
        if (filteredActions.length > 0 && !filteredActions.includes(notification.action)) {
          return null
        }

        return message
      },
    },
    getSessionExpiredAt() > new Date(),
  )
  return lastJsonMessage
}
