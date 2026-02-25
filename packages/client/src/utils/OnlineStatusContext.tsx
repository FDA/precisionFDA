import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const OFFLINE_MESSAGE = 'Connection lost. Some actions may be unavailable until you are back online.'
const ONLINE_MESSAGE = 'Connection restored. You are back online.'

type OnlineStatusContextValue = {
  isOnline: boolean
}

const OnlineStatusContext = createContext<OnlineStatusContextValue | undefined>(undefined)

type OnlineStatusProviderProps = {
  children: React.ReactNode
}

export const OnlineStatusProvider = ({ children }: OnlineStatusProviderProps) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => window.navigator.onLine)
  const wasOfflineRef = useRef<boolean>(!window.navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOfflineRef.current) {
        toast.info(ONLINE_MESSAGE)
        wasOfflineRef.current = false
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      if (!wasOfflineRef.current) {
        toast.warn(OFFLINE_MESSAGE)
      }
      wasOfflineRef.current = true
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!window.navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const value = useMemo<OnlineStatusContextValue>(() => ({ isOnline }), [isOnline])

  return <OnlineStatusContext.Provider value={value}>{children}</OnlineStatusContext.Provider>
}

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext)
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider')
  }
  return context
}
