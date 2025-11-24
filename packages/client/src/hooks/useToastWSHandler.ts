import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { BasicToast, ToastWithLink } from '../components/Toast'
import { NOTIFICATION_ACTION, Notification, SEVERITY, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../features/home/types'
import { confirmNotification } from '../features/notifications/notifications.api'
import {
  DEFAULT_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_INTERVAL,
  SHOULD_RECONNECT,
  getNodeWsUrl,
  notificationsConfig,
} from '../utils/config'
import { getSessionExpiredAt } from '../utils/cookies'

// list of notifications that do not show a toast
const NO_TOAST_NOTIFICATIONS = [
  NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
  NOTIFICATION_ACTION.JOB_RUNNABLE,
  NOTIFICATION_ACTION.FILE_CLOSED,
  NOTIFICATION_ACTION.JOB_INITIALIZING,
  NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED,
  NOTIFICATION_ACTION.CHALLENGE_CARD_IMAGE_URL_UPDATED,
  NOTIFICATION_ACTION.CHALLENGE_RESOURCE_URL_UPDATED,
  NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
  NOTIFICATION_ACTION.USER_PROVISIONING_ERROR,
]

const toastHandlers = {
  [SEVERITY.ERROR]: toast.error,
  [SEVERITY.WARN]: toast.warning,
  [SEVERITY.INFO]: toast.success,
}

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

export const useToastWSHandler = () => {
  const lastJsonMessage = useLastWSNotification()

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    const notification = lastJsonMessage.data as Notification

    console.log(`Received notification ${JSON.stringify(notification)}`)
    if (!NO_TOAST_NOTIFICATIONS.includes(notification.action)) {
      const toastContent =
        notification.meta?.linkTitle && notification.meta?.linkUrl
          ? ToastWithLink({
              message: notification.message,
              linkTitle: notification.meta?.linkTitle,
              linkUrl: notification.meta?.linkUrl,
              linkTarget: notification.meta?.linkTarget,
            })
          : BasicToast(notification.message)

      try {
        toastHandlers[notification.severity](toastContent, notificationsConfig)
      } catch {
        toast.error(toastContent, notificationsConfig)
      }
    }
    confirmNotification(notification.id).then(() => console.log(`Notification with id: ${notification.id} has been confirmed`))
  }, [lastJsonMessage])
}
