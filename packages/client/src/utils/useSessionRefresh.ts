import { focusManager } from '@tanstack/react-query'
import { differenceInSeconds } from 'date-fns'
import { throttle } from 'lodash'
import { useEffect } from 'react'
import { refreshSession } from './api'
import { getSessionExpiredAt } from './cookies'

/**
 * Session Refresh Hook
 *
 * Automatically refreshes user session when it's about to expire and user shows activity.
 * Integrates with React Query's focus manager to detect when the application regains focus.
 *
 * @param user - Current authenticated user object. Hook only activates when user exists.
 *
 * Features:
 * - Monitors session expiration using cookies (sessionExpiredAt)
 * - Triggers refresh when session expires in ≤ 5 minutes
 * - Throttles refresh calls to once every 15 seconds maximum
 * - Prevents duplicate refresh requests with internal throttling flag
 * - Detects user activity via keyboard and mouse movement events
 * - Integrates with React Query's focusManager for app focus detection
 */
export const useSessionRefresh = (
  sessionExpirationPassed: boolean,
  hasExpirationReachedLimit: boolean,
  isThrottled: React.RefObject<boolean>,
) => {
  useEffect(() => {
    if (sessionExpirationPassed) {
      return
    }
    const THRESHOLD = 5 * 60
    const THROTTLE_INTERVAL = 15000

    focusManager.setEventListener(onFocus => {
      const handleFocusWithRefresh = throttle(() => {
        onFocus()
        const calcDiff = differenceInSeconds(getSessionExpiredAt(), new Date())
        if (calcDiff <= THRESHOLD && !hasExpirationReachedLimit && !isThrottled.current) {
          isThrottled.current = true
          refreshSession().finally(() => {
            isThrottled.current = false
          })
        }
      }, THROTTLE_INTERVAL)

      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('keydown', handleFocusWithRefresh, false)
        window.addEventListener('mousemove', handleFocusWithRefresh, false)
      }
      return () => {
        window.removeEventListener('keydown', handleFocusWithRefresh)
        window.removeEventListener('mousemove', handleFocusWithRefresh)
      }
    })

    return () => {
      focusManager.setEventListener(() => () => {})
    }
  }, [sessionExpirationPassed, hasExpirationReachedLimit])
}
