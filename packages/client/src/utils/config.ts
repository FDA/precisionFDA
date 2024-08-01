import { ToastOptions } from 'react-toastify'

/**
 * Returns localhost:3001 for development on local machine and
 * corresponding hostname for everything else (no need for port).
 *
 * @returns WebSocket url
 */
export const getNodeWsUrl = () => {
  if (window?.location) {
    const { host } = window.location
    if (host.includes('0.0.0.0')) {
      return 'wss://0.0.0.0:3001'
    }
    if (host.includes('localhost')) {
      return 'wss://localhost:3001'
    }
    return `wss://${host}/ws`
  }
  return ''
}

/**
 * Toastify configuration for notifications.
 */
export const notificationsConfig: ToastOptions = {
  autoClose: false,
}

export const DEFAULT_RECONNECT_INTERVAL = 1000 // ms
export const DEFAULT_RECONNECT_ATTEMPTS = 1000 // ms
export const SHOULD_RECONNECT = !ENABLE_DEV_MSW
