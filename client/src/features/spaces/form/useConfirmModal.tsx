import React from 'react'
import { ButtonSolidBlue } from '../../../components/Button'
import { Modal } from '../../modal'
import { useModal } from '../../modal/useModal'

export const useConfirmModal = ({ shouldConfirm, callback }: { shouldConfirm: boolean, callback: () => void }) => {
  const modal = useModal(shouldConfirm)
  const onSubmit = () => {
    modal.setShowModal(false)
    callback()
  }
  const modalComp = () => (<Modal isShown={modal.isShown} headerText="Confirm" id="confirm" hide={() => modal.setShowModal(false)}>
    <div>should be confirmed</div>
    <ButtonSolidBlue onClick={onSubmit}>Confirm</ButtonSolidBlue>
  </Modal>)

  return {
    shouldConfirm,
    modal: modalComp,
  }
}
