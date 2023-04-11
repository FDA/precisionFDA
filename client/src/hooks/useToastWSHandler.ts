import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { ToastWithLink } from '../components/Toast'
import { confirmNotification } from '../features/home/notifications/notifications.api'
import { Notification, SEVERITY } from '../features/home/types'
import { IUser } from '../types/user'
import {
  DEFAULT_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_INTERVAL,
  getNodeWsUrl,
  notificationsConfig,
} from '../utils/config'

const toastHandlers = {
  [SEVERITY.ERROR]: toast.error,
  [SEVERITY.WARN]: toast.warning,
  [SEVERITY.INFO]: toast.success,
}

export const useToastWSHandler = (user?: IUser) => {
  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(getNodeWsUrl(), 
  { share: true, reconnectInterval: DEFAULT_RECONNECT_INTERVAL, 
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS, shouldReconnect: () => true })

  useEffect(() => {
    if (user?.session_id && readyState === 1) {
      sendMessage(`{"action":"login", "session_id": "${user?.session_id}"}`)
    }
  }, [readyState, user?.session_id])

  useEffect(() => {
    if (lastJsonMessage != null) {
      console.log(`Received notification ${lastJsonMessage}`)
      const notification: Notification = JSON.parse(JSON.stringify(lastJsonMessage))
      const toastContent = (notification.meta?.linkTitle && notification.meta?.linkUrl) ? ToastWithLink({
        message: notification.message,
        linkTitle: notification.meta?.linkTitle,
        linkUrl: notification.meta?.linkUrl,
      }) : notification.message

      try {
        toastHandlers[notification.severity](toastContent, notificationsConfig)
      } catch {
        toast.error(toastContent, notificationsConfig)
      }
      confirmNotification(notification.id)
          .then(() => console.log(`Notification with id: ${notification.id} has been confirmed`))
    }
  }, [lastJsonMessage])
}