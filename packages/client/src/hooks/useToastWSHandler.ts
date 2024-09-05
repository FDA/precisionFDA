import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { BasicToast, ToastWithLink } from '../components/Toast'
import { NOTIFICATION_ACTION, Notification, SEVERITY, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../features/home/types'
import { confirmNotification } from '../features/notifications/notifications.api'
import { IUser } from '../types/user'
import {
  DEFAULT_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_INTERVAL,
  SHOULD_RECONNECT,
  getNodeWsUrl,
  notificationsConfig,
} from '../utils/config'

// list of notifications that do not show a toast
const NO_TOAST_NOTIFICATIONS = [
  NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
  NOTIFICATION_ACTION.JOB_RUNNABLE,
  NOTIFICATION_ACTION.FILE_CLOSED,
  NOTIFICATION_ACTION.JOB_INITIALIZING,
  NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED,
  NOTIFICATION_ACTION.CHALLENGE_CARD_IMAGE_URL_UPDATED,
  NOTIFICATION_ACTION.CHALLENGE_RESOURCE_URL_UPDATED,
]

const toastHandlers = {
  [SEVERITY.ERROR]: toast.error,
  [SEVERITY.WARN]: toast.warning,
  [SEVERITY.INFO]: toast.success,
}

export const useToastWSHandler = (user?: IUser) => {
  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const data = JSON.parse(message.data)
        return data.type === WEBSOCKET_MESSSAGE_TYPE.NOTIFICATION
      } catch (e) {
        return false
      }
    },
  })

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
