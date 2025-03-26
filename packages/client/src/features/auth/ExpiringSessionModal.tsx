import { differenceInSeconds, subSeconds } from 'date-fns/esm'
import React, { useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { useInterval } from '../../hooks/useInterval'
import { getSessionExpiredAt } from '../../utils/cookies'
import { pluralize } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import { useAuthUserQuery } from './api'
import {
  onLogInWithSSO, useSiteSettingsQuery,
} from './useSiteSettingsQuery'
import { sessionService } from '../../utils/sessionService'
import { useAuthUser } from './useAuthUser'

export const ExpiringSessionModal: React.FC<{ modal: UseModal }> = ({
  modal,
}) => {
  const userQuery = useAuthUserQuery()
  const [expiredAt, setExpiredAtTimer] = useState<Date|number>(
    getSessionExpiredAt(),
  )
  const [timer, setTimer] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const sessionExpirationPassed = expiredAt < currentTime
  const sessionExpirationApproaching = !sessionExpirationPassed
  const hasExpirationReachedLimit = sessionExpirationApproaching && subSeconds(expiredAt, 59) < currentTime
  const calcDiff = differenceInSeconds(expiredAt, currentTime)
  const { data: ssoButtonResponse } = useSiteSettingsQuery()
  const user = useAuthUser()

  // Start/stop automatic session refreshing on user activity
  useEffect(() => {
    if (user) {
      sessionService.startSessionRefreshing()
    } else {
      sessionService.stopSessionRefreshing()
    }

    // Cleanup
    return () => {
      sessionService.stopSessionRefreshing()
    }
  }, [user?.id])

  useEffect(() => {
    if (hasExpirationReachedLimit) {
      if (calcDiff > 0) setTimer(calcDiff)
      sessionService.stopSessionRefreshing()
      modal.setShowModal(true)
    }
  }, [hasExpirationReachedLimit, calcDiff])

  useInterval(() => {
    setExpiredAtTimer(getSessionExpiredAt())
    if (!hasExpirationReachedLimit) {
      setCurrentTime(new Date())
    }
  }, 15000)

  useInterval(
    () => {
      setCurrentTime(new Date())
      setTimer(calcDiff)
    },
    modal.isShown && timer >= 0 ? 1000 : null,
  )

  const handleStayLoggedIn = async () => {
    await userQuery.refetch()
    setExpiredAtTimer(getSessionExpiredAt())
    modal.setShowModal(false)
    sessionService.startSessionRefreshing()
  }

  const ssoUrl = ssoButtonResponse?.ssoButton.isEnabled ? ssoButtonResponse.ssoButton.data?.ssoUrl : undefined

  return (
    <ModalNext
      id="expiring-session-modal"
      isShown={modal.isShown}
      blur
      hide={() => {}}
    >
      <ModalHeaderTop
        disableClose
        headerText={sessionExpirationPassed ? 'Session Expired' : 'Session Expiring'}
        hide={() => modal.setShowModal(false)}
      />
      <Content $overflowContent={false}>
        {sessionExpirationPassed
          ? 'You have been automatically logged out due to inactivity.'
          : `You are about to be logged out in ${timer} ${pluralize('second', timer)} due to inactivity.`}
      </Content>
      <Footer>
        {sessionExpirationPassed ? (
          <>
            {ssoUrl && (
              <Button data-variant="primary" onClick={() => onLogInWithSSO(ssoUrl)}>
                Log In with SSO
              </Button>
            )}
            {/* {TODO: this does not consider location to return to after login.} */}
            <Button data-variant="primary" onClick={() => window.location.assign('/login')}>
              Log In again
            </Button>
          </>
        ) : (
          <Button data-variant="primary" onClick={handleStayLoggedIn}>
            Extend session
          </Button>
        )}
      </Footer>
    </ModalNext>
  )
}
