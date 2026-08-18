import { differenceInSeconds, subSeconds } from 'date-fns'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useInterval } from '../../hooks/useInterval'
import { getSessionExpiredAt } from '../../utils/cookies'
import { pluralize } from '../../utils/formatting'
import { useSessionRefresh } from '../../utils/useSessionRefresh'
import type { UseModal } from '../modal/useModal'
import { useAuthUserQuery } from './api'
import { onLogInWithSSO, useSiteSettingsQuery } from './useSiteSettingsQuery'

export const ExpiringSessionModal: React.FC<{ modal: UseModal }> = ({ modal }) => {
  const isThrottled = useRef(false)
  const userAuthQuery = useAuthUserQuery()
  const { data: ssoButtonResponse } = useSiteSettingsQuery()
  const [expiredAt, setExpiredAtTimer] = useState<Date | number>(getSessionExpiredAt())
  const [timer, setTimer] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const WARNING_THRESHOLD_SECONDS = 59
  const sessionExpirationPassed = expiredAt < currentTime
  const sessionExpirationApproaching = !sessionExpirationPassed
  const hasExpirationReachedLimit =
    sessionExpirationApproaching && subSeconds(expiredAt, WARNING_THRESHOLD_SECONDS) < currentTime
  const calcDiff = differenceInSeconds(expiredAt, currentTime)

  useSessionRefresh(sessionExpirationPassed, hasExpirationReachedLimit, isThrottled)

  useEffect(() => {
    if (hasExpirationReachedLimit && !modal.isShown) {
      setTimer(calcDiff)
      modal.setShowModal(true)
    }
  }, [hasExpirationReachedLimit])

  useInterval(
    () => {
      const newExpiredAt = getSessionExpiredAt()
      setExpiredAtTimer(newExpiredAt)
      if (!hasExpirationReachedLimit) {
        setCurrentTime(new Date())
      }
      // if session is extended by other action, close the modal
      if (subSeconds(newExpiredAt, WARNING_THRESHOLD_SECONDS) > currentTime && modal.isShown) {
        modal.setShowModal(false)
      }
    },
    !sessionExpirationPassed ? 15000 : null,
  )

  useInterval(
    () => {
      setCurrentTime(new Date())
      setTimer(calcDiff)
    },
    modal.isShown && timer >= 0 ? 1000 : null,
  )

  const handleStayLoggedIn = async () => {
    await userAuthQuery.refetch()
    setExpiredAtTimer(getSessionExpiredAt())
    modal.setShowModal(false)
  }

  const ssoUrl = ssoButtonResponse?.ssoButton.isEnabled ? ssoButtonResponse.ssoButton.data?.ssoUrl : undefined

  return (
    <Dialog open={Boolean(modal.isShown)} onOpenChange={() => {}}>
      <DialogContent
        id="expiring-session-modal"
        showCloseButton={false}
        overlayClassName="supports-backdrop-filter:backdrop-blur-[6px]"
        className="gap-4"
      >
        <DialogHeader>
          <DialogTitle>{sessionExpirationPassed ? 'Session Expired' : 'Session Expiring'}</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          {sessionExpirationPassed
            ? 'You have been automatically logged out due to inactivity.'
            : `You are about to be logged out in ${timer} ${pluralize('second', timer)} due to inactivity.`}
        </div>
        <DialogFooter>
          {sessionExpirationPassed ? (
            <>
              {ssoUrl && <Button onClick={() => onLogInWithSSO(ssoUrl)}>Log In with SSO</Button>}
              {/* {TODO: this does not consider location to return to after login.} */}
              <Button onClick={() => window.location.assign('/login')}>Log In again</Button>
            </>
          ) : (
            <Button onClick={handleStayLoggedIn}>Extend session</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
