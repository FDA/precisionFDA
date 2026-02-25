import React from 'react'
import { Button } from '@/components/Button'
import { ModalHeaderTop, ModalNext } from '@/features/modal/ModalNext'
import { ButtonRow, Footer } from '@/features/modal/styles'

interface UploadConflictModalProps {
  isShown: boolean
  onCancel: () => void
  onOpenExisting: () => void
}

export const UploadConflictModal: React.FC<UploadConflictModalProps> = ({ isShown, onCancel, onOpenExisting }) => {
  return (
    <ModalNext
      id="modal-upload-conflict"
      data-testid="modal-upload-conflict"
      isShown={isShown}
      hide={onCancel}
      variant="medium"
    >
      <ModalHeaderTop headerText="Active Upload in Progress" hide={onCancel} />
      <div style={{ padding: '1rem' }}>
        <p>You have an active file upload in another location.</p>
        <p>You can open the existing upload or close this dialog to continue.</p>
      </div>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={onCancel}>
            Close
          </Button>
          <Button type="button" onClick={onOpenExisting}>
            Open Upload
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
}
