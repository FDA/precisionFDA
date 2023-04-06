import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { confirmNotification } from '../features/home/notifications/notifications.api'
import { Notification, SEVERITY } from '../features/home/types'
import { IUser } from '../types/user'
import {
  DEFAULT_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_INTERVAL,
  getNodeWsUrl,
  notificationsConfig,
} from '../utils/config'

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
      switch (notification.severity) {
        case SEVERITY.ERROR : {
          toast.error(notification.message, notificationsConfig)
          break
        }
        case SEVERITY.WARN : {
          toast.warning(notification.message, notificationsConfig)
          break
        }
        case SEVERITY.INFO : {
          toast.success(notification.message, notificationsConfig)
          break
        }
        default: {
          toast.error(notification.message, notificationsConfig)
        }
      }
      confirmNotification(notification.id)
          .then(() => console.log(`Notification with id: ${notification.id} has been confirmed`))
    }
  }, [lastJsonMessage])
}