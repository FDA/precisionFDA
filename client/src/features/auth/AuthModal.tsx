import React from 'react'
import { ButtonSolidBlue } from '../../components/Button'
import { Modal } from '../modal'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'

export const AuthModal: React.FC<UseModal> = (props) => {
  return (
    <Modal
      isShown={props.isShown}
      hide={() => props.setShowModal(false)}
      headerText='Session Expired'
      disableClose={true}
      blur>
      <Content>You were logged out after 15 minutes of inactivity. Please log in again.</Content>
      <Footer>
        {/* @ts-ignore */}
        <ButtonSolidBlue onClick={() => window.location = '/login'}>Login</ButtonSolidBlue>
      </Footer>
    </Modal>
  )
}
