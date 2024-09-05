import React from 'react'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import { onLogInWithSSO, useSiteSettingsQuery } from './useSiteSettingsQuery'
import { Button } from '../../components/Button'


export const AuthModal: React.FC<UseModal> = props => {
  const { data } = useSiteSettingsQuery()
  return (
    <ModalNext
      isShown={props.isShown}
      hide={() => props.setShowModal(false)}
      headerText="Session Expired"
      id='session-expired-modal'
      disableClose
      blur
    >
      <ModalHeaderTop
        disableClose
        headerText="Session Expired"
        hide={() => props.setShowModal(false)}
      />
      <Content $overflowContent={false}>
        You were logged out after 15 minutes of inactivity. Please Log In again.
      </Content>
      <Footer>
        <ButtonRow>
          {data?.ssoButton.isEnabled && (
            <Button data-variant="primary" onClick={() => onLogInWithSSO(data.ssoButton.data.fdaSsoUrl)}>
              Log In with SSO
            </Button>
          )}
          <Button data-variant="primary" onClick={() => (window.location = '/login')}>
            Log in
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
}
