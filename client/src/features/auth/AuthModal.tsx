import React from 'react'
import { ButtonSolidBlue } from '../../components/Button'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import { onLogInWithSSO, useSiteSettingsQuery } from './useSiteSettingsQuery'


export const AuthModal: React.FC<UseModal> = props => {
  const { data } = useSiteSettingsQuery()
  return (
    <ModalNext
      isShown={props.isShown}
      hide={() => props.setShowModal(false)}
      headerText="Session Expired"
      disableClose
      blur
    >
      <ModalHeaderTop
        disableClose
        headerText="Session Expired"
        hide={() => props.setShowModal(false)}
      />
      <Content overflowContent={false}>
        You were logged out after 15 minutes of inactivity. Please log in again.
      </Content>
      <Footer>
        <ButtonRow>
          {data?.ssoButton.isEnabled && (
            <ButtonSolidBlue onClick={() => onLogInWithSSO(data)}>
              Log In With SSO
            </ButtonSolidBlue>
          )}
          <ButtonSolidBlue onClick={() => (window.location = '/login')}>
            Log in
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
}
