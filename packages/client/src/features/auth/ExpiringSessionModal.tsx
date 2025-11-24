import { differenceInSeconds, subSeconds } from 'date-fns'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { useInterval } from '../../hooks/useInterval'
import { getSessionExpiredAt } from '../../utils/cookies'
import { pluralize } from '../../utils/formatting'
import { useSessionRefresh } from '../../utils/useSessionRefresh'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
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
  const hasExpirationReachedLimit = sessionExpirationApproaching && subSeconds(expiredAt, WARNING_THRESHOLD_SECONDS) < currentTime
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
    <ModalNext id="expiring-session-modal" isShown={modal.isShown} blur hide={() => {}}>
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
