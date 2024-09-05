import React from 'react'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { Button } from '../../../../components/Button'

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
        <Button data-variant="primary" onClick={() => cb('copy')}>Copy</Button>
        <Button data-variant="primary" onClick={() => cb('upload')}>Add</Button>
      </div>
    </Modal>
  )
}
