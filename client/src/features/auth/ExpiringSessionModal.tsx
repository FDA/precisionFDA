import { differenceInSeconds, fromUnixTime, subSeconds } from 'date-fns/esm'
import React, { useEffect, useState } from 'react'
import { ButtonSolidBlue } from '../../components/Button'
import { useInterval } from '../../hooks/useInterval'
import { getCookie } from '../../utils/cookies'
import { pluralize } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import { useAuthUserQuery } from './useAuthUser'
import {
  onLogInWithSSO,
  useSiteSettingsSsoButtonQuery,
} from './useSiteSettingsSsoButtonQuery'

const getSessionExpiredAt = () => {
  const cookie = getCookie('sessionExpiredAt')
  if (!cookie) return 0
  return fromUnixTime(parseInt(cookie || '0', 10))
}

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
  const { data: ssoButtonResponse } = useSiteSettingsSsoButtonQuery()

  useEffect(() => {
    if (hasExpirationReachedLimit) {
      if (calcDiff > 0) setTimer(calcDiff)
      modal.setShowModal(true)
    }
  }, [currentTime])

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
  }

  return (
    <ModalNext
      id="expiring-session-modal"
      isShown={modal.isShown}
      disableClose
      blur
      hide={() => {}}
    >
      <ModalHeaderTop
        disableClose
        headerText={sessionExpirationPassed ? 'Session Expired' : 'Session Expiring'}
        hide={() => modal.setShowModal(false)}
      />
      <Content overflowContent={false}>
        {sessionExpirationPassed
          ? 'You have been automatically logged out due to inactivity.'
          : `You are about to be logged out in ${timer} ${pluralize('second', timer)} due to inactivity.`}
      </Content>
      <Footer>
        {sessionExpirationPassed ? (
          <>
            {ssoButtonResponse?.isEnabled && (
              <ButtonSolidBlue onClick={() => onLogInWithSSO(ssoButtonResponse)}>
                Log In With SSO
              </ButtonSolidBlue>
            )}
            <ButtonSolidBlue onClick={() => window.location.assign('/login')}>
              Log in again
            </ButtonSolidBlue>
          </>
        ) : (
          <ButtonSolidBlue onClick={handleStayLoggedIn}>
            Extend session
          </ButtonSolidBlue>
        )}
      </Footer>
    </ModalNext>
  )
}
