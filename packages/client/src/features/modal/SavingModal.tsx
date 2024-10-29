import React from 'react'
import { ModalHeaderTop, ModalNext } from './ModalNext'
import { Content } from './styles'

// TODO how about a different name for this? like Processing modal, because it doesn't have to be just saving
export const SavingModal = ({
  headerText,
  body,
  isSaving,
  modalId,
}: {
  headerText: string
  body: React.ReactNode
  isSaving: boolean
  modalId: string
}) => {
  return (
    <ModalNext
      id={modalId}
      isShown={isSaving}
      hide={() => null}
      headerText={headerText}
    >
      <ModalHeaderTop
        disableClose
        headerText={headerText}
        hide={() => null}
      />
      <Content $overflowContent={false}>
        {body}
      </Content>
    </ModalNext>
  )
}
