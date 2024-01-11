import React from 'react'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Content } from '../../modal/styles'

export const ChallengeCreateUpdateModal = ({
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
      headerText={isEditMode ? 'Updating challenge' : 'Creating new challenge'}
      disableClose
    >
      <ModalHeaderTop
        disableClose
        headerText={
          isEditMode ? 'Updating challenge' : 'Creating new challenge'
        }
        hide={() => null}
      />
      <Content $overflowContent={false}>
        The challenge is being {isEditMode ? 'updated' : 'created'}, please wait
        until this message disappears.
      </Content>
    </ModalNext>
  )
}
