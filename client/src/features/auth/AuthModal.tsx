import React from 'react'
import { ButtonSolidBlue } from '../../components/Button'
import { Modal } from '../modal'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import { onLogInWithSSO, useSiteSettingsSsoButtonQuery } from './useSiteSettingsSsoButtonQuery'

export const AuthModal: React.FC<UseModal> = (props) => {
  const { data: ssoButtonResponse } = useSiteSettingsSsoButtonQuery()
  return (
    <Modal
      isShown={props.isShown}
      hide={() => props.setShowModal(false)}
      headerText='Session Expired'
      disableClose
      blur>
      <Content>You were logged out after 15 minutes of inactivity. Please log in again.</Content>
      <Footer>
        {ssoButtonResponse?.isEnabled && (
          <ButtonSolidBlue onClick={() => onLogInWithSSO(ssoButtonResponse)}>
            Log In With SSO
          </ButtonSolidBlue>
        )}
        <ButtonSolidBlue onClick={() => window.location = '/login'}>Login</ButtonSolidBlue>
      </Footer>
    </Modal>
  )
}
