import { useEffect } from 'react'
import { displayPayloadMessage, type Payload } from '@/utils/api'

export function useRailsFlashMessages() {
  useEffect(() => {
    let isCancelled = false

    const fetchFlashMessages = async () => {
      try {
        const response = await fetch('/api/flash_messages', { credentials: 'same-origin' })
        if (!response.ok) return

        const payload: Payload = await response.json()
        if (!isCancelled) {
          displayPayloadMessage(payload)
        }
      } catch (error) {
        console.error('Failed to fetch Rails flash messages', error)
      }
    }

    void fetchFlashMessages()

    return () => {
      isCancelled = true
    }
  }, [])
}
