import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { BasicToast, ToastWithLink } from '../components/Toast'
import { confirmNotification } from '../features/notifications/notifications.api'
import { Notification, NOTIFICATION_ACTION, SEVERITY } from '../features/home/types'
import { IUser } from '../types/user'
import {
  DEFAULT_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_INTERVAL,
  getNodeWsUrl,
  notificationsConfig,
} from '../utils/config'

// list of notifications that do not show a toast
const NO_TOAST_NOTIFICATIONS = [
  NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
  NOTIFICATION_ACTION.JOB_RUNNABLE,
  NOTIFICATION_ACTION.JOB_INITIALIZING,
]

const toastHandlers = {
  [SEVERITY.ERROR]: toast.error,
  [SEVERITY.WARN]: toast.warning,
  [SEVERITY.INFO]: toast.success,
}

export const useToastWSHandler = (user?: IUser) => {
  const { sendMessage, lastJsonMessage: notification, readyState } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => true,
  })

  useEffect(() => {
    if (user?.session_id && readyState === 1) {
      sendMessage(`{"action":"login", "session_id": "${user?.session_id}"}`)
    }
  }, [readyState, user?.session_id])

  useEffect(() => {
    if (notification == null) {
        return
    }

    console.log(`Received notification ${JSON.stringify(notification)}`)
    if (!NO_TOAST_NOTIFICATIONS.includes(notification.action)) {
      const toastContent = (notification.meta?.linkTitle && notification.meta?.linkUrl) ? ToastWithLink({
        message: notification.message,
        linkTitle: notification.meta?.linkTitle,
        linkUrl: notification.meta?.linkUrl,
      }) : BasicToast(notification.message)

      try {
        toastHandlers[notification.severity](toastContent, notificationsConfig)
      } catch {
        toast.error(toastContent, notificationsConfig)
      }
    }
    confirmNotification(notification.id)
        .then(() => console.log(`Notification with id: ${notification.id} has been confirmed`))
  }, [notification])
}