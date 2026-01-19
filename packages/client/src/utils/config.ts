import { ToastOptions } from 'react-toastify'
import { IS_DEV, ENABLE_DEV_MSW } from './env'

/**
 * Returns the WebSocket URL for the notification service.
 * When running in development mode, connects directly to nginx on port 3000.
 * For all other environments, uses the current host.
 *
 * @returns WebSocket url or null if location is not available
 */
export const getNodeWsUrl = (): string | null => {
  if (window?.location) {
    const { hostname } = window.location
    // In development mode, connect directly to nginx (port 3000)
    if (IS_DEV) {
      return `wss://${hostname}:3000/ws`
    }
    return `wss://${window.location.host}/ws`
  }
  return null
}

/**
 * Toastify configuration for notifications.
 */
export const notificationsConfig: ToastOptions = {}

export const DEFAULT_RECONNECT_INTERVAL = 1000 // ms
export const DEFAULT_RECONNECT_ATTEMPTS = 1000 // ms
export const SHOULD_RECONNECT = !ENABLE_DEV_MSW
