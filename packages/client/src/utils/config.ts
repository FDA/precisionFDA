import { ToastOptions } from 'react-toastify'

/**
 * Returns localhost:3001 for development on local machine and
 * corresponding hostname for everything else (no need for port).
 *
 * @returns WebSocket url or null if location is not available
 */
export const getNodeWsUrl = (): string | null => {
  if (window?.location) {
    const { host } = window.location
    return `wss://${host}/ws`
  }
  return null
}

/**
 * Toastify configuration for notifications.
 */
export const notificationsConfig: ToastOptions = {
  autoClose: false,
}

export const DEFAULT_RECONNECT_INTERVAL = 1000 // ms
export const DEFAULT_RECONNECT_ATTEMPTS = 1000 // ms
export const SHOULD_RECONNECT = !process.env.ENABLE_DEV_MSW
