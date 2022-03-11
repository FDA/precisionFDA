import React from 'react'
import { ButtonSolidBlue } from '../../components/Button'
import { Modal } from '../modal'
import { UseModal } from '../modal/useModal'

export const AuthModal: React.FC<UseModal> = (props) => {
  return (
    <Modal isShown={props.isShown} hide={() => props.setShowModal(false)} headerText='You were logged out after some inactivity.' blur>
      Click the button to log back in.
      {/* @ts-ignore */}
      <ButtonSolidBlue onClick={() => window.location = '/login'}>Login</ButtonSolidBlue>
    </Modal>
  )
}