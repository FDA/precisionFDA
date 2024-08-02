import React from 'react'
import { LoginButton } from '../../components/Button/LoginButton'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import { useSiteSettingsQuery } from './useSiteSettingsQuery'

export const AuthModal: React.FC<UseModal> = props => {
  const { data } = useSiteSettingsQuery()
  return (
    <ModalNext
      isShown={props.isShown}
      hide={() => props.setShowModal(false)}
      headerText="Session Expired"
      id="session-expired-modal"
      disableClose
      blur
    >
      <ModalHeaderTop disableClose headerText="Session Expired" hide={() => props.setShowModal(false)} />
      <Content $overflowContent={false}>You were logged out after 15 minutes of inactivity. Please Log In again.</Content>
      <Footer>
        <ButtonRow>
          <LoginButton siteSetting={data} />
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
}
