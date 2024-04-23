import React from 'react'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Content } from '../../modal/styles'

export const SavingModal = ({
  isEditMode,
  isSaving,
}: {
  isEditMode: boolean
  isSaving: boolean
}) => {
  return (
    <ModalNext
      isShown={isSaving}
      hide={() => null}
      headerText={isEditMode ? 'Updating Data Portal' : 'Creating new Data Portal'}
      disableClose
    >
      <ModalHeaderTop
        disableClose
        headerText={
          isEditMode ? 'Updating Data Portal' : 'Creating new Data Portal'
        }
        hide={() => null}
      />
      <Content $overflowContent={false}>
        The Data Portal is being {isEditMode ? 'updated' : 'created'}, please wait
        until this message disappears.
      </Content>
    </ModalNext>
  )
}
