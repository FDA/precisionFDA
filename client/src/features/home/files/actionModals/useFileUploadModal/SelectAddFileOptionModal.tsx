import React from 'react'
import { ButtonSolidBlue } from '../../../../../components/Button'
import { Modal } from '../../../../modal'
import { useModal } from '../../../../modal/useModal'

export const SelectAddFileOptionModal = ({ cb }: any) => {
  const { isShown, setShowModal } = useModal()
  return (
    <Modal
      data-testid="modal-files-upload"
      headerText={`Upload files to ${'' ? 'folder' : 'root'}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <div>
        <ButtonSolidBlue onClick={() => cb('copy')}>Copy</ButtonSolidBlue>
        <ButtonSolidBlue onClick={() => cb('upload')}>Add</ButtonSolidBlue>
      </div>
    </Modal>
  )
}
